import { Head, usePage } from '@inertiajs/react';
import EmojiPicker from 'emoji-picker-react';
import type {EmojiClickData} from 'emoji-picker-react';
import Echo from 'laravel-echo';
import { MessageSquare, Mic, Paperclip, Send, Search, Phone, Smile, X, ChevronDown } from 'lucide-react';
import Pusher from 'pusher-js';
import { useEffect, useRef, useState } from 'react';
import ChatSidebar from '@/components/entradas/chat-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { chats as entradasChats, messages as entradasMessages, send as entradasSend } from '@/routes/admin/entradas';
import { upload as mediaUpload } from '@/routes/admin/media';
import type { LocalConversation, LocalMessage } from '@/types';
import { renderMessageText } from '@/utils/message';

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
    if (mimetype.startsWith('image/')) {
return 'image';
}

    if (mimetype.startsWith('video/')) {
return 'video';
}

    if (mimetype.startsWith('audio/')) {
return 'audio';
}

    return 'document';
}

export default function EntradasChat({ instance }: { instance: string }) {
    const { inboxes } = usePage().props as unknown as {
        inboxes: { id: number; name: string; type: string; webhook_enabled: boolean; config: { ownerJid?: string; profileName?: string; profilePicUrl?: string } | null }[];
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
    const [dragOver, setDragOver] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<LocalConversation | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const echoRef = useRef<Echo<'reverb'> | null>(null);
    const pendingMsgRef = useRef<{ channel_id: string; tempId: number } | null>(null);
    const selectedConvRef = useRef(selectedConv);
    selectedConvRef.current = selectedConv;

const instInfo = (inboxes ?? []).find(
        (i) => i.name === instance,
    );
    const instName = instInfo?.name ?? instance;

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
                setConversations((prev) =>
                    prev.map((c) =>
                        c.channel_id === selectedConv!.channel_id
                            ? { ...c, unread_count: 0 }
                            : c,
                    ),
                );
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
                channelAuthorization: {
                    endpoint: '/broadcasting/auth',
                    transport: 'ajax',
                },
            });

            echoRef.current = new Echo({
                broadcaster: 'reverb',
                client: pusherClient,
                authEndpoint: '/broadcasting/auth',
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

            const pending = pendingMsgRef.current;

            if (pending && pending.channel_id === msg.channel_id && msg.input_output === false) {
                setMessages((prev) =>
                    prev.map((m) => (m.id === pending.tempId ? { ...msg, id: msg.id } : m)),
                );
                pendingMsgRef.current = null;
            }

            if (data.channel_id === selectedConvRef.current?.channel_id) {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === msg.id)) {
                        return prev;
                    }

                    return [...prev, msg];
                });
            }

            if (msg.input_output === true) {
                window.dispatchEvent(new CustomEvent('notify:message', {
                    detail: {
                        channel_id: data.channel_id,
                        instance,
                        contact_name: data.contact.name,
                        contact_avatar: data.contact.profile_pic_url,
                        message_preview: msg.media_url ? '📎 Archivo' : (msg.text ?? '—'),
                        created_at: msg.created_at,
                    },
                }));
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

                fetch(entradasChats(instance).url, {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (Array.isArray(data)) {
                            setConversations(data);
                        }
                    })
                    .catch(() => {});

                return prev;
            });
        });

        return () => {
            channel.stopListening('.message.created');
            echo.leave(`entradas.${instance}`);
        };
    }, [instance]);

    useEffect(() => {
        if (isAtBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
            setUnreadCount((c) => c + 1);
        }
    }, [messages]);

    const handleScroll = () => {
        const el = messagesContainerRef.current;

        if (!el) {
return;
}

        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
        setIsAtBottom(atBottom);

        if (atBottom) {
            setUnreadCount(0);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setUnreadCount(0);
        setIsAtBottom(true);
    };

    const filteredConversations = conversations.filter((c) => {
        if (!search) {
return true;
}

        return c.contact.name?.toLowerCase().includes(search.toLowerCase());
    });

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
                sender_phone: null,
                sender_name: null,
                sender_avatar: null,
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

    function handleEmojiClick(emoji: EmojiClickData) {
        setInput((prev) => prev + emoji.emoji);
        setShowEmojiPicker(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];

        if (file && selectedConv) {
            setPickedFile(file);
        }
    }

    async function handleDelete(conv: LocalConversation) {
        await fetch(`/admin/entradas/${instance}/conversations/${conv.id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
                Accept: 'application/json',
            },
        });
        setSelectedConv(null);
        setConversations((prev) => prev.filter((c) => c.channel_id !== conv.channel_id));
        setDeleteDialog(null);
    }

    const phoneNumber = selectedConv?.channel_id ?? '';

    return (
        <>
            <Head title={`Entradas - ${instName}`} />

            <div className="flex h-[calc(100dvh-4rem)] overflow-hidden md:h-[calc(100dvh-5rem)]">
                <div className="flex w-80 shrink-0 flex-col border-r">
                    <div className="flex items-center gap-2 border-b p-3">
                        <Avatar className="size-8 shrink-0">
                            <AvatarImage src={instInfo?.config?.profilePicUrl ?? undefined} />
                            <AvatarFallback className="text-xs">
                                {instName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{instName}</p>
                            <p className="truncate text-xs text-muted-foreground">
                                {conversations.length} conversaciones
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
                                                {conv.contact.name || conv.channel_id}
                                            </p>
                                            {conv.unread_count > 0 && (
                                                <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                                                    {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                                </span>
                                            )}
                                            {conv.last_message?.created_at && (
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {formatDatetime(conv.last_message.created_at)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {conv.channel_id}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {conv.last_message?.text ?? '—'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex flex-1 flex-col relative">
                        {selectedConv ? (
                        <>
                            <div className="flex items-center gap-3 border-b p-3">
                                <button
                                    type="button"
                                    className="flex min-w-0 flex-1 items-center gap-3"
                                    onClick={() => {
                                        setSidebarChannelId(selectedConv.channel_id);
                                        setSidebarContactId(selectedConv.contact_id);
                                    }}
                                >
                                    <Avatar className="size-9 shrink-0">
                                        <AvatarImage src={selectedConv.contact.profile_pic_url ?? undefined} />
                                        <AvatarFallback className="text-xs">
                                            {(selectedConv.contact.name ?? '?').charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1 text-left">
                                        <p className="truncate text-sm font-semibold">
                                            {selectedConv.contact.name || selectedConv.channel_id}
                                        </p>
                                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Phone className="size-3 shrink-0" />
                                            <span className="truncate">{selectedConv.channel_id}</span>
                                        </p>
                                    </div>
                                </button>
                            </div>

                            <div
                                ref={messagesContainerRef}
                                className={`flex-1 overflow-y-auto ${dragOver ? 'ring-2 ring-primary' : ''}`}
                                onScroll={handleScroll}
                                onDragOver={(e) => {
 e.preventDefault(); setDragOver(true); 
}}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                            >
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
                                            const isGroup = !!msg.sender_phone;

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className="max-w-[75%]">
                                                        {isGroup && (
                                                            <div className="mb-1 flex items-start gap-1.5">
                                                                <Avatar className="mt-0.5 size-5">
                                                                    <AvatarImage src={msg.sender_avatar ?? undefined} />
                                                                    <AvatarFallback className="text-[10px]">
                                                                        {(msg.sender_name ?? msg.sender_phone ?? '?').charAt(0).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="leading-tight">
                                                                    <p className="text-sm font-medium text-foreground">
                                                                        {msg.sender_name || msg.sender_phone || 'Desconocido'}
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground/60">
                                                                        {msg.sender_phone ?? ''}@s.whatsapp.net
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="rounded-2xl bg-muted px-4 py-2 text-sm">
                                                            {msg.media_url && msg.message_type === 'audioMessage' ? (
                                                                <audio src={msg.media_url} controls className="h-10 w-48" />
                                                            ) : msg.media_url && (msg.message_type === 'imageMessage' || msg.message_type === 'stickerMessage') ? (
                                                                <img src={msg.media_url} alt="" className="max-h-36 max-w-56 rounded-lg object-contain cursor-pointer hover:opacity-80" loading="lazy" onClick={() => setLightboxSrc(msg.media_url)} />
                                                            ) : msg.media_url && msg.message_type === 'videoMessage' ? (
                                                                <video src={msg.media_url} controls className="max-h-36 max-w-56 rounded-lg" />
                                                            ) : msg.media_url && msg.media_url.endsWith('.pdf') ? (
                                                                <div className="flex flex-col gap-1">
                                                                    <iframe src={msg.media_url} className="w-56 h-32 rounded-lg border" />
                                                                    {msg.text && (
                                                                        <p className="whitespace-pre-wrap break-words text-xs">
                                                                            {renderMessageText(msg.text)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : msg.media_url ? (
                                                                <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="underline">
                                                                    📎 {msg.text || 'Ver archivo'}
                                                                </a>
                                                            ) : null}
                                                            {msg.text && !msg.media_url?.endsWith('.pdf') && (
                                                                <p className="whitespace-pre-wrap break-words">
                                                                    {renderMessageText(msg.text)}
                                                                </p>
                                                            )}
                                                            <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
                                                                {formatDatetime(msg.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {!isAtBottom && (
                                <button
                                    type="button"
                                    onClick={scrollToBottom}
                                    className="absolute bottom-24 right-6 z-50 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
                                    title="Ir abajo"
                                >
                                    {unreadCount > 0 ? (
                                        <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    ) : (
                                        <ChevronDown className="size-5" />
                                    )}
                                </button>
                            )}

                            <div className="border-t p-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="*/*"
                                    className="hidden"
                                    onChange={handleFilePicked}
                                />

                                {pickedFile ? (
                                    <div className="flex flex-col gap-2 rounded-lg border bg-muted/50 p-2">
                                        <div className="flex items-center gap-2">
                                            {pickedFile.type.startsWith('image/') && (
                                                <img
                                                    src={URL.createObjectURL(pickedFile)}
                                                    alt="preview"
                                                    className="size-10 shrink-0 rounded object-cover"
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            )}
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
                                        <textarea
                                            placeholder="Añade un caption..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendFile();
                                                }
                                            }}
                                            onInput={(e) => {
                                                const el = e.currentTarget;
                                                el.style.height = 'auto';
                                                el.style.height = el.scrollHeight + 'px';
                                            }}
                                            className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[32px] max-h-24"
                                            rows={1}
                                            disabled={uploading}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-end gap-1.5 flex-nowrap">
                                        <div className="flex items-center gap-0">
                                            <button
                                                type="button"
                                                className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={sending || uploading || recording}
                                                title="Adjuntar archivo"
                                            >
                                                <Paperclip className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className={`flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 ${recording ? 'animate-pulse text-red-500' : ''}`}
                                                onClick={toggleRecording}
                                                disabled={sending || uploading}
                                                title={recording ? 'Detener grabación' : 'Grabar audio'}
                                            >
                                                <Mic className="size-4" />
                                            </button>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                                                    onClick={() => setShowEmojiPicker((v) => !v)}
                                                    title="Emojis"
                                                >
                                                    <Smile className="size-4" />
                                                </button>
                                                {showEmojiPicker && (
                                                    <div className="absolute bottom-full left-0 mb-1 z-50">
                                                        <div
                                                            className="fixed inset-0 z-40"
                                                            onClick={() => setShowEmojiPicker(false)}
                                                        />
                                                        <div className="relative z-50">
                                                            <EmojiPicker
                                                                onEmojiClick={handleEmojiClick}
                                                                skinTonesDisabled
                                                                searchDisabled={false}
                                                                width={300}
                                                                height={350}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <textarea
                                                placeholder={
                                                    recording
                                                        ? 'Grabando...'
                                                        : 'Escribe un mensaje...'
                                                }
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                onPaste={(e) => {
                                                    const items = e.clipboardData?.items;
                                                    if (!items) return;
                                                    for (const item of items) {
                                                        if (item.type.startsWith('image/')) {
                                                            e.preventDefault();
                                                            const file = item.getAsFile();
                                                            if (file && selectedConv) {
                                                                setPickedFile(file);
                                                            }
                                                            return;
                                                        }
                                                    }
                                                }}
                                                onInput={(e) => {
                                                    const el = e.currentTarget;
                                                    el.style.height = 'auto';
                                                    el.style.height = el.scrollHeight + 'px';
                                                }}
                                                className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[38px] max-h-28"
                                                rows={1}
                                                disabled={sending || uploading || recording}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                                            onClick={handleSendText}
                                            disabled={!input.trim() || sending || uploading || recording}
                                            title="Enviar"
                                        >
                                            <Send className="size-4" />
                                        </button>
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
                contactPhone={sidebarChannelId}
                contactName={selectedConv?.contact.name ?? null}
                contactAvatar={selectedConv?.contact.profile_pic_url ?? null}
                messages={messages}
                onClose={() => {
                    setSidebarChannelId(null);
                    setSidebarContactId(null);
                }}
                onDelete={selectedConv ? () => {
 setDeleteDialog(selectedConv); setSidebarChannelId(null); setSidebarContactId(null); 
} : undefined}
            />

            <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar conversación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de eliminar la conversación con "{deleteDialog?.contact.name || deleteDialog?.channel_id}"?
                            Se eliminarán todos los mensajes.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={() => deleteDialog && handleDelete(deleteDialog)}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!lightboxSrc} onOpenChange={() => setLightboxSrc(null)}>
                <DialogContent className="max-w-3xl p-0 bg-transparent border-0">
                    <button
                        type="button"
                        className="absolute right-2 top-2 z-50 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                        onClick={() => setLightboxSrc(null)}
                    >
                        <X className="size-4" />
                    </button>
                    {lightboxSrc && (
                        <img
                            src={lightboxSrc}
                            alt=""
                            className="max-h-[85vh] w-auto rounded-lg object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
