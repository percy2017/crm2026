import { Head, router, usePage } from '@inertiajs/react';
import Echo from 'laravel-echo';
import { ArrowLeft, Info, MessageSquare, Mic, Paperclip, Send, Search, Phone, X } from 'lucide-react';
import Pusher from 'pusher-js';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import ChatSidebar from '@/components/entradas/chat-sidebar';
import { upload as mediaUpload } from '@/routes/admin/media';
import { chats as entradasChats, messages as entradasMessages, send as entradasSend } from '@/routes/admin/entradas';
import type { EvolutionInstance, LocalConversation, LocalMessage } from '@/types';

function formatDatetime(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
        return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    }

    if (days === 1) {
        return 'Ayer';
    }

    if (days < 7) {
        return d.toLocaleDateString('es-PE', { weekday: 'short' });
    }

    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
}

function ChatSkeleton() {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
            </div>
        </div>
    );
}

function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

async function uploadToMedios(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(mediaUpload().url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: formData,
    });

    if (!res.ok) {
        throw new Error('Upload failed');
    }

    const data = await res.json();

    return data.filename;
}

function detectMediaType(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';

    return 'document';
}

export default function EntradasChat({ instance }: { instance: string }) {
    const { evolutionInstances } = usePage().props as unknown as {
        evolutionInstances: EvolutionInstance[];
    };
    const [conversations, setConversations] = useState<LocalConversation[]>([]);
    const [messages, setMessages] = useState<LocalMessage[]>([]);
    const [selectedConv, setSelectedConv] = useState<LocalConversation | null>(null);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [search, setSearch] = useState('');
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [sidebarChannelId, setSidebarChannelId] = useState<string | null>(null);
    const [sidebarContactId, setSidebarContactId] = useState<number | null>(null);
    const [recording, setRecording] = useState(false);
    const [pickedFile, setPickedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const echoRef = useRef<Echo<'reverb'> | null>(null);
    const pendingMsgRef = useRef<{ channel_id: string; tempId: number } | null>(null);
    const selectedConvRef = useRef(selectedConv);
    selectedConvRef.current = selectedConv;

    const instInfo = (evolutionInstances ?? []).find(
        (i) => i.name === instance,
    );
    const instName = instInfo?.name ?? instance;

    function formatPhone(jid: string | null): string {
        if (!jid) return '';
        const num = jid.split('@')[0];
        if (num.length >= 8) {
            return `+${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
        }
        return `+${num}`;
    }

    const instPhone = formatPhone(instInfo?.ownerJid ?? null) || instInfo?.number || '';

    useEffect(() => {
        const url = entradasChats(instance).url;
        setLoadingChats(true);

        fetch(url, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => res.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setConversations(list);
            })
            .catch(() => {})
            .finally(() => setLoadingChats(false));
    }, [instance]);

    useEffect(() => {
        if (!selectedConv) {
            return;
        }

        const url = entradasMessages(instance).url;
        setLoadingMessages(true);

        fetch(`${url}?channel_id=${encodeURIComponent(selectedConv.channel_id)}`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => res.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setMessages(list.reverse());
            })
            .catch(() => {})
            .finally(() => setLoadingMessages(false));
    }, [instance, selectedConv]);

    useEffect(() => {
        if (!echoRef.current) {
            const pusherClient = new Pusher(import.meta.env.VITE_REVERB_APP_KEY, {
                cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
                wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
                wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 6001),
                wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 6001),
                forceTLS: false,
                enabledTransports: ['ws', 'wss'],
            });

            echoRef.current = new Echo({
                broadcaster: 'reverb',
                client: pusherClient,
            } as any);
        }

        const echo = echoRef.current;
        const channel = echo.private(`entradas.${instance}`);

        channel.listen('.message.created', (data: {
            channel_id: string;
            message: LocalMessage;
            contact: { name: string | null; phone: string | null; profile_pic_url: string | null };
        }) => {
            const msg = data.message;

            if (msg.input_output === false) {
                const pending = pendingMsgRef.current;
                if (pending && pending.channel_id === msg.channel_id) {
                    setMessages((prev) =>
                        prev.map((m) => (m.id === pending.tempId ? { ...msg, id: msg.id } : m)),
                    );
                    pendingMsgRef.current = null;
                    return;
                }
            }

            if (data.channel_id === selectedConvRef.current?.channel_id) {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === msg.id)) {
                        return prev;
                    }
                    return [...prev, msg];
                });
            }

            setConversations((prev) => {
                const exists = prev.find((c) => c.channel_id === data.channel_id);
                if (exists) {
                    return prev
                        .map((c) =>
                            c.channel_id === data.channel_id
                                ? {
                                    ...c,
                                    last_message: {
                                        text: msg.media_url ? '📎 Archivo' : msg.text,
                                        created_at: msg.created_at,
                                    },
                                    contact: {
                                        name: data.contact.name ?? c.contact.name,
                                        phone: data.contact.phone ?? c.contact.phone,
                                        profile_pic_url: data.contact.profile_pic_url ?? c.contact.profile_pic_url,
                                    },
                                }
                                : c,
                        )
                        .sort((a, b) => {
                            const aTime = a.last_message?.created_at ?? '';
                            const bTime = b.last_message?.created_at ?? '';
                            return bTime.localeCompare(aTime);
                        });
                }

                return [
                    {
                        id: 0,
                        contact_id: null,
                        channel_id: data.channel_id,
                        contact: {
                            name: data.contact.name ?? null,
                            phone: data.contact.phone ?? null,
                            profile_pic_url: data.contact.profile_pic_url ?? null,
                        },
                        last_message: {
                            text: msg.media_url ? '📎 Archivo' : (msg.text ?? '—'),
                            created_at: msg.created_at,
                        },
                    },
                    ...prev,
                ];
            });
        });

        return () => {
            channel.stopListening('.message.created');
            echo.leave(`entradas.${instance}`);
        };
    }, [instance]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const filteredConversations = conversations.filter((c) =>
        c.contact.name?.toLowerCase().includes(search.toLowerCase()),
    );

    async function sendMessage(payload: {
        number: string;
        text?: string;
        channel_id: string;
        media_url?: string;
        media_type?: string;
        media_mimetype?: string;
        file_name?: string;
    }) {
        setSending(true);

        const tempId = Date.now();
        pendingMsgRef.current = { channel_id: payload.channel_id, tempId };

        setMessages((prev) => [
            ...prev,
            {
                id: tempId,
                channel_id: payload.channel_id,
                input_output: false,
                message_type: payload.media_url
                    ? (payload.media_type === 'audio' ? 'audioMessage' : payload.media_type === 'image' ? 'imageMessage' : 'documentMessage')
                    : 'extendedTextMessage',
                text: payload.text ?? null,
                media_url: payload.media_url
                    ? `/storage/${payload.media_url}`
                    : null,
                created_at: new Date().toISOString(),
            },
        ]);

        try {
            const res = await fetch(entradasSend(instance).url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                return;
            }

            const data = await res.json();

            if (data.message) {
                const real = data.message;
                setMessages((prev) =>
                    prev.map((m) => (m.id === tempId ? { ...real, id: real.id } : m)),
                );
                pendingMsgRef.current = null;
            }

            setInput('');
            setPickedFile(null);
        } catch {
            // ignore
        } finally {
            setSending(false);
        }
    }

    function handleSendText() {
        if (!input.trim() || !selectedConv) {
            return;
        }

        sendMessage({
            number: selectedConv.channel_id.split('@')[0],
            text: input.trim(),
            channel_id: selectedConv.channel_id,
        });
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendText();
        }
    }

    function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !selectedConv) {
            return;
        }

        setPickedFile(file);
        e.target.value = '';
    }

    async function handleSendFile() {
        if (!pickedFile || !selectedConv) {
            return;
        }

        setUploading(true);

        try {
            const filename = await uploadToMedios(pickedFile);
            const mediaType = detectMediaType(pickedFile.type);

            sendMessage({
                number: selectedConv.channel_id.split('@')[0],
                text: input.trim() || undefined,
                channel_id: selectedConv.channel_id,
                media_url: filename,
                media_type: mediaType,
                media_mimetype: pickedFile.type,
                file_name: pickedFile.name,
            });
        } catch {
            // ignore
        } finally {
            setUploading(false);
        }
    }

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());

                if (audioChunksRef.current.length === 0 || !selectedConv) {
                    return;
                }

                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });

                setUploading(true);

                try {
                    const filename = await uploadToMedios(file);

                    sendMessage({
                        number: selectedConv.channel_id.split('@')[0],
                        channel_id: selectedConv.channel_id,
                        media_url: filename,
                        media_type: 'audio',
                        media_mimetype: 'audio/webm',
                        file_name: file.name,
                    });
                } catch {
                    // ignore
                } finally {
                    setUploading(false);
                }
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setRecording(true);
        } catch {
            // ignore
        }
    }

    function stopRecording() {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    }

    function toggleRecording() {
        if (recording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    const phoneNumber = selectedConv?.channel_id.split('@')[0] ?? '';

    return (
        <>
            <Head title={`Entradas - ${instName}`} />

            <div className="flex h-[calc(100dvh-4rem)] overflow-hidden md:h-[calc(100dvh-5rem)]">
                <div className="flex w-80 shrink-0 flex-col border-r">
                    <div className="flex items-center gap-2 border-b p-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0"
                            onClick={() => router.visit('/admin/evolution-instances')}
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                        <Avatar className="size-8 shrink-0">
                            <AvatarImage src={instInfo?.profilePicUrl ?? undefined} />
                            <AvatarFallback className="text-xs">
                                {instName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{instName}</p>
                            <p className="truncate text-xs text-muted-foreground">
                                {instPhone || `${conversations.length} conversaciones`}
                            </p>
                        </div>
                    </div>

                    <div className="border-b p-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 pl-8 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingChats ? (
                            <>
                                <ChatSkeleton />
                                <ChatSkeleton />
                                <ChatSkeleton />
                                <ChatSkeleton />
                                <ChatSkeleton />
                            </>
                        ) : filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
                                <MessageSquare className="size-8" />
                                <p className="text-sm">Sin conversaciones</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <button
                                    key={conv.channel_id}
                                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${
                                        selectedConv?.channel_id === conv.channel_id
                                            ? 'bg-accent'
                                            : ''
                                    }`}
                                    onClick={() => setSelectedConv(conv)}
                                >
                                    <Avatar className="size-10 shrink-0">
                                        <AvatarImage src={conv.contact.profile_pic_url ?? undefined} />
                                        <AvatarFallback className="text-xs">
                                            {(conv.contact.name ?? '?').charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="truncate text-sm font-medium">
                                                {conv.contact.name || phoneNumber}
                                            </p>
                                            {conv.last_message?.created_at && (
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {formatDatetime(conv.last_message.created_at)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {conv.last_message?.text ?? '—'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex flex-1 flex-col">
                    {selectedConv ? (
                        <>
                            <div className="flex items-center gap-3 border-b p-3">
                                <Avatar className="size-9 shrink-0">
                                    <AvatarImage src={selectedConv.contact.profile_pic_url ?? undefined} />
                                    <AvatarFallback className="text-xs">
                                        {(selectedConv.contact.name ?? '?').charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold">
                                        {selectedConv.contact.name || phoneNumber}
                                    </p>
                                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Phone className="size-3" />
                                        {phoneNumber}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 shrink-0"
                                    onClick={() => {
                                        setSidebarChannelId(selectedConv.channel_id);
                                        setSidebarContactId(selectedConv.contact_id);
                                    }}
                                >
                                    <Info className="size-4" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {loadingMessages ? (
                                    <div className="space-y-3 p-4">
                                        <Skeleton className="ml-12 h-8 w-48" />
                                        <Skeleton className="h-8 w-36" />
                                        <Skeleton className="ml-12 h-8 w-56" />
                                        <Skeleton className="h-8 w-40" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
                                        <MessageSquare className="size-8" />
                                        <p className="text-sm">No hay mensajes</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 p-4">
                                        {messages.map((msg) => {
                                            const isMe = msg.input_output === false;

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                                                            isMe
                                                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                                                : 'bg-muted rounded-bl-md'
                                                        }`}
                                                    >
                                                        {msg.media_url && msg.message_type === 'audioMessage' ? (
                                                            <audio src={msg.media_url} controls className="h-10 w-48" />
                                                        ) : msg.media_url && msg.message_type === 'imageMessage' ? (
                                                            <img src={msg.media_url} alt="" className="max-w-full rounded-lg" />
                                                        ) : msg.media_url ? (
                                                            <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="underline">
                                                                {msg.text || 'Ver archivo'}
                                                            </a>
                                                        ) : null}
                                                        <p className="whitespace-pre-wrap break-words">
                                                            {msg.text || '—'}
                                                        </p>
                                                        <p
                                                            className={`mt-0.5 text-right text-[10px] ${
                                                                isMe
                                                                    ? 'text-primary-foreground/60'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        >
                                                            {formatDatetime(msg.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            <div className="border-t p-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="*/*"
                                    className="hidden"
                                    onChange={handleFilePicked}
                                />

                                {pickedFile ? (
                                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2">
                                        <span className="min-w-0 flex-1 truncate text-sm">
                                            {pickedFile.name}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 shrink-0"
                                            onClick={() => setPickedFile(null)}
                                            disabled={uploading}
                                        >
                                            <X className="size-3.5" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSendFile}
                                            disabled={uploading}
                                        >
                                            {uploading ? 'Subiendo...' : 'Enviar'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-10 shrink-0"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={sending || uploading || recording}
                                        >
                                            <Paperclip className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`size-10 shrink-0 ${recording ? 'animate-pulse text-red-500' : ''}`}
                                            onClick={toggleRecording}
                                            disabled={sending || uploading}
                                        >
                                            <Mic className="size-4" />
                                        </Button>
                                        <div className="flex-1">
                                            <Input
                                                placeholder={
                                                    recording
                                                        ? 'Grabando...'
                                                        : 'Escribe un mensaje...'
                                                }
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                className="min-h-[40px] resize-none"
                                                disabled={sending || uploading || recording}
                                            />
                                        </div>
                                        <Button
                                            size="icon"
                                            onClick={handleSendText}
                                            disabled={!input.trim() || sending || uploading || recording}
                                            className="size-10 shrink-0"
                                        >
                                            <Send className="size-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
                            <MessageSquare className="size-12" />
                            <p className="text-lg font-medium">Selecciona una conversación</p>
                            <p className="text-sm">
                                Elige un chat de la lista para empezar
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ChatSidebar
                channelId={sidebarChannelId}
                contactId={sidebarContactId}
                messages={messages}
                onClose={() => {
                    setSidebarChannelId(null);
                    setSidebarContactId(null);
                }}
            />
        </>
    );
}
