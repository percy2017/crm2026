import { Head } from '@inertiajs/react';
import Echo from 'laravel-echo';
import { Info, MessageSquare, Mic, Paperclip, Send, Search, Trash2, X } from 'lucide-react';
import Pusher from 'pusher-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

type Visitor = {
    id: number;
    name: string;
    current_page: string | null;
    last_seen_at: string | null;
};

type AssignedUser = { id: number; name: string };

type Conversation = {
    id: number;
    status: string;
    unread_count: number;
    visitor: Visitor;
    widget: { name: string };
    assigned_user: AssignedUser | null;
    created_at: string;
    last_message: string | null;
    last_message_at: string | null;
};

type Message = {
    id: number;
    content: string;
    is_from_visitor: boolean;
    created_at: string;
};

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

function renderMessageText(text: string): React.ReactNode {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) =>
        urlRegex.test(part) ? (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                {part}
            </a>
        ) : (
            part
        ),
    );
}

export default function WebChatIndex() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selected, setSelected] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [search, setSearch] = useState('');
    const [sending, setSending] = useState(false);
    const [recording, setRecording] = useState(false);
    const [pickedFile, setPickedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<Conversation | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const pendingMsgRef = useRef<{ tempId: number } | null>(null);
    const selectedRef = useRef(selected);
    selectedRef.current = selected;

    const fetchConversations = useCallback(() => {
        setLoadingChats(true);
        fetch('/admin/web-chat/conversations', {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.conversations) {
setConversations(data.conversations);
}
            })
            .catch(() => {})
            .finally(() => setLoadingChats(false));
    }, []);

    const echoRef = useRef<Echo<'reverb'> | null>(null);

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
        const channel = echo.private('web-chat');

        channel.listen('.web-message.created', (data: {
            conversation_id: number;
            visitor_id: number;
            visitor_name: string;
            widget_id: number;
            widget_name: string;
            message: { id: number; content: string; is_from_visitor: boolean; created_at: string };
        }) => {
            const msg = data.message;

            if (data.message.is_from_visitor) {
                window.dispatchEvent(new CustomEvent('notify:message', {
                    detail: {
                        channel_id: `web-chat-${data.conversation_id}`,
                        instance: 'web-chat',
                        contact_name: data.visitor_name,
                        contact_avatar: null,
                        message_preview: data.message.content,
                        created_at: data.message.created_at,
                    },
                }));
            }

            setConversations((prev) => {
                const idx = prev.findIndex((c) => c.id === data.conversation_id);

                if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = {
                        ...updated[idx],
                        last_message: data.message.content,
                        last_message_at: data.message.created_at,
                        unread_count: selectedRef.current?.id !== data.conversation_id
                            ? updated[idx].unread_count + 1
                            : updated[idx].unread_count,
                    };

                    return updated.sort((a, b) => {
                        const aTime = a.last_message_at ?? '';
                        const bTime = b.last_message_at ?? '';

                        return bTime.localeCompare(aTime);
                    });
                }

                return prev;
            });

            if (selectedRef.current?.id === data.conversation_id) {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === data.message.id)) {
return prev;
}

                    return [...prev, data.message];
                });
            }
        });

        return () => {
            channel.stopListening('.web-message.created');
            echo.leave('web-chat');
        };
    }, []);

    useEffect(() => {
 fetchConversations(); 
}, [fetchConversations]);

    const fetchMessages = useCallback((convId: number) => {
        setLoadingMessages(true);
        fetch(`/admin/web-chat/conversations/${convId}/messages`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.messages) {
setMessages(data.messages);
}
            })
            .catch(() => {})
            .finally(() => setLoadingMessages(false));
    }, []);

    useEffect(() => {
        if (selected) {
            fetchMessages(selected.id);
        } else {
            setMessages([]);
        }
    }, [selected, fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const filteredConversations = conversations.filter((c) =>
        c.visitor.name?.toLowerCase().includes(search.toLowerCase()),
    );

    async function sendMessage(content: string) {
        if (!selected || !content.trim()) {
return;
}

        setSending(true);

        const tempId = Date.now();
        pendingMsgRef.current = { tempId };

        setMessages((prev) => [
            ...prev,
            { id: tempId, content: content.trim(), is_from_visitor: false, created_at: new Date().toISOString() },
        ]);

        try {
            const res = await fetch(`/admin/web-chat/conversations/${selected.id}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
                body: JSON.stringify({ content: content.trim() }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, id: data.message.id } : m)));
                pendingMsgRef.current = null;
            }
        } catch {
            // ignore
        } finally {
            setSending(false);
        }
    }

    function handleSendText() {
        if (!messageInput.trim() || !selected) {
return;
}

        const text = messageInput.trim();
        setMessageInput('');
        sendMessage(text);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendText();
        }
    }

    function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file || !selected) {
return;
}

        setPickedFile(file);
        e.target.value = '';
    }

    async function handleSendFile() {
        if (!pickedFile || !selected) {
return;
}

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', pickedFile);

            const res = await fetch('/admin/media/upload', {
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
            const filename = data.filename;

            const caption = messageInput.trim();
            setMessageInput('');
            sendMessage(caption ? `[📎 ${pickedFile.name}] ${caption}` : `[📎 ${pickedFile.name}]`);
            setPickedFile(null);
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

                if (audioChunksRef.current.length === 0 || !selected) {
return;
}

                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });

                setUploading(true);

                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    const res = await fetch('/admin/media/upload', {
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
                    sendMessage(`[🎤 Audio] ${data.filename}`);
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

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];

        if (file && selected) {
setPickedFile(file);
}
    }

    const handleSelect = (conv: Conversation) => {
        setSelected(conv);
        setConversations((prev) =>
            prev.map((c) =>
                c.id === conv.id ? { ...c, unread_count: 0 } : c,
            ),
        );
    };

    const handleDelete = async (conv: Conversation) => {
        await fetch(`/admin/web-chat/conversations/${conv.id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
                Accept: 'application/json',
            },
        });
        setSelected(null);
        fetchConversations();
        setDeleteDialog(null);
    };

    return (
        <>
            <Head title="Web Chat" />

            <div className="flex h-[calc(100dvh-4rem)] overflow-hidden md:h-[calc(100dvh-5rem)]">
                <div className="flex w-80 shrink-0 flex-col border-r">
                    <div className="flex items-center gap-2 border-b p-3">
                        <Avatar className="size-8 shrink-0">
                            <AvatarFallback className="text-xs">WC</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">Web Chat</p>
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
                                    key={conv.id}
                                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${
                                        selected?.id === conv.id ? 'bg-accent' : ''
                                    }`}
                                    onClick={() => handleSelect(conv)}
                                >
                                    <Avatar className="size-10 shrink-0">
                                        <AvatarFallback className="text-xs">
                                            {(conv.visitor.name ?? '?').charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="truncate text-sm font-medium">
                                                {conv.visitor.name || 'Anonymous'}
                                            </p>
                                            {conv.last_message_at && (
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {formatDatetime(conv.last_message_at)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {conv.widget.name}
                                        </p>
                                        {conv.last_message && (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {conv.last_message}
                                            </p>
                                        )}
                                    </div>
                                    {conv.unread_count > 0 && (
                                        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex flex-1 flex-col">
                    {selected ? (
                        <>
                            <div className="flex w-full items-center gap-3 border-b p-3 text-left">
                                <Avatar className="size-9 shrink-0">
                                    <AvatarFallback className="text-xs">
                                        {(selected.visitor.name ?? '?').charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold">
                                        {selected.visitor.name || 'Anonymous'}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {selected.visitor.current_page ?? ''}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-destructive"
                                        onClick={() => setDeleteDialog(selected)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>

                            <div
                                className={`flex-1 overflow-y-auto ${dragOver ? 'ring-2 ring-primary' : ''}`}
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
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
                                        <MessageSquare className="size-8" />
                                        <p className="text-sm">No hay mensajes</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 p-4">
                                        {messages.map((m) => (
                                            <div
                                                key={m.id}
                                                className={`flex ${m.is_from_visitor ? 'justify-start' : 'justify-end'}`}
                                            >
                                                <div className="max-w-[75%] rounded-2xl bg-muted px-4 py-2 text-sm">
                                                    <p className="whitespace-pre-wrap break-words">
                                                        {renderMessageText(m.content)}
                                                    </p>
                                                    <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
                                                        {formatDatetime(m.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
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
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
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
                                    <div className="flex items-end gap-2 flex-nowrap">
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
                                        <div className="min-w-0 flex-1">
                                            <textarea
                                                placeholder={
                                                    recording ? 'Grabando...' : 'Escribe un mensaje...'
                                                }
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                onInput={(e) => {
                                                    const el = e.currentTarget;
                                                    el.style.height = 'auto';
                                                    el.style.height = el.scrollHeight + 'px';
                                                }}
                                                className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] max-h-32"
                                                rows={1}
                                                disabled={sending || uploading || recording}
                                            />
                                        </div>
                                        <Button
                                            size="icon"
                                            onClick={handleSendText}
                                            disabled={!messageInput.trim() || sending || uploading || recording}
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

            <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar conversación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de eliminar la conversación con "{deleteDialog?.visitor.name}"?
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
        </>
    );
}