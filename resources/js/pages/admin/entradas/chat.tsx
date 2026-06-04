import { Head, usePage } from '@inertiajs/react';
import Echo from 'laravel-echo';
import { ChevronDown, MessageSquare, X } from 'lucide-react';
import Pusher from 'pusher-js';
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ChatConversationList } from '@/components/entradas/chat/chat-conversation-list';
import { ChatHeader } from '@/components/entradas/chat/chat-header';
import { ChatInputFooter } from '@/components/entradas/chat/chat-input-footer';
import { ChatMessageBubble } from '@/components/entradas/chat/chat-message-bubble';
import ChatSidebar from '@/components/entradas/chat-sidebar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { chats as entradasChats, messages as entradasMessages, send as entradasSend, reaction as entradasReaction } from '@/routes/admin/entradas';
import { upload as mediaUpload } from '@/routes/admin/media';
import type { LocalConversation, LocalMessage } from '@/types';

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
        return mimetype === 'image/webp' ? 'sticker' : 'image';
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
        inboxes: { id: number; name: string; type: string; webhook_enabled: boolean; config: { ownerJid?: string; profileName?: string; profilePicUrl?: string; connectionStatus?: string } | null }[];
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
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; msg: LocalMessage } | null>(null);
    const [quickReplyQuery, setQuickReplyQuery] = useState<string | null>(null);
    const [msgSearch, setMsgSearch] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiDraft, setAiDraft] = useState<string | null>(null);
    const [aiConfirmOpen, setAiConfirmOpen] = useState(false);
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

    const [connectionStatus, setConnectionStatus] = useState<string | undefined>(
        (inboxes ?? []).find((i) => i.name === instance)?.config?.connectionStatus ?? 'unknown',
    );

    const [chatTab, setChatTab] = useState<'unread' | 'read'>('unread');

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

                const targetChannelId = new URLSearchParams(window.location.search).get('channel_id');

                if (targetChannelId) {
                    const match = list.find((c: LocalConversation) => c.channel_id === targetChannelId);

                    if (match) {
                        setSelectedConv(match);
                    } else {
                        setSelectedConv({
                            channel_id: targetChannelId,
                            instance,
                            inbox_id: null,
                            contact_id: null,
                            unread_count: 0,
                            status: 'active',
                            assigned_to: null,
                            contact: { id: null, name: null, phone: null, profile_pic_url: null },
                            last_message: null,
                        } as LocalConversation);
                    }

                    window.history.replaceState({}, '', window.location.pathname);
                }
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
                        channel_id: data.channel_id,
                        instance,
                        inbox_id: (data as any).inbox_id ?? null,
                        contact_id: (data as any).contact_id ?? null,
                        unread_count: msg.input_output ? 1 : 0,
                        status: 'active',
                        assigned_to: null,
                        contact: {
                            id: (data as any).contact_id ?? null,
                            name: (data as any).contact_name ?? data.contact.name,
                            phone: (data as any).contact_phone ?? data.contact.phone,
                            profile_pic_url: (data as any).contact_avatar ?? data.contact.profile_pic_url,
                        },
                        last_message: {
                            text: msg.media_url ? '📎 Archivo' : msg.text,
                            created_at: msg.created_at,
                        },
                    } as LocalConversation,
                    ...prev,
                ];
            });
        });

        channel.listen('.message.status.updated', (data: {
            id?: number;
            channel_id: string;
            message_id: string;
            status: string;
        }) => {
            if (data.channel_id === selectedConvRef.current?.channel_id) {
                setMessages((prev) =>
                    prev.map((m) =>
                        (m.message_id && m.message_id === data.message_id)
                        || (data.id != null && m.id === data.id)
                            ? { ...m, status: data.status as LocalMessage['status'] }
                            : m,
                    ),
                );
            }
        });

        channel.listen('.inbox.status.updated', (data: {
            connection_status: string;
        }) => {
            setConnectionStatus(data.connection_status);
        });

        return () => {
            channel.stopListening('.message.created');
            channel.stopListening('.message.status.updated');
            channel.stopListening('.inbox.status.updated');
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

    useEffect(() => {
        const el = messagesContainerRef.current;
        if (!el) return;

        const observer = new ResizeObserver(() => {
            if (isAtBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
            }
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, [isAtBottom]);

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
        if (chatTab === 'unread' && !c.unread_count) {
            return false;
        }

        if (chatTab === 'read' && c.unread_count > 0) {
            return false;
        }

        if (!search) {
            return true;
        }

        const q = search.toLowerCase();
        const phoneFromJid = c.channel_id.split('@')[0];

        return c.contact.name?.toLowerCase().includes(q)
            || c.contact.phone?.includes(q)
            || phoneFromJid.includes(q);
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
        setInput('');
        setPickedFile(null);

        const textarea = document.querySelector<HTMLTextAreaElement>(
            '.entrada-textarea',
        );
        if (textarea) {
            textarea.style.height = 'auto';
        }

        const tempId = Date.now();
        pendingMsgRef.current = { channel_id: payload.channel_id, tempId };

        const tempMessageType = payload.media_url
            ? (payload.media_type === 'audio' ? 'audioMessage'
                : payload.media_type === 'image' ? 'imageMessage'
                : payload.media_type === 'video' ? 'videoMessage'
                : payload.media_type === 'sticker' ? 'stickerMessage'
                : 'documentMessage')
            : 'extendedTextMessage';

        setMessages((prev) => [
            ...prev,
            {
                id: tempId,
                channel_id: payload.channel_id,
                message_id: null,
                input_output: false,
                message_type: tempMessageType,
                text: payload.text ?? null,
                media_url: payload.media_url
                    ? `/storage/${payload.media_url}`
                    : null,
                created_at: new Date().toISOString(),
                sender_phone: null,
                sender_name: null,
                sender_avatar: null,
                reaction_to: null,
                status: 'pending',
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
                const data = await res.json().catch(() => ({}));
                toast.error(data.error ?? 'Error al enviar mensaje');
                setMessages((prev) => prev.filter((m) => m.id !== tempId));
                pendingMsgRef.current = null;

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
        } catch (e) {
            toast.error('Error de conexión al enviar mensaje');
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            pendingMsgRef.current = null;
        } finally {
            setSending(false);
        }
    }

    const sendReaction = useCallback(async (msg: LocalMessage, emoji: string) => {
        if (!selectedConv || !msg.message_id) return;

        const number = selectedConv.channel_id.split('@')[0];
        const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

        try {
            const res = await fetch(entradasReaction(instance).url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrf,
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    number,
                    message_id: msg.message_id,
                    emoji,
                }),
            });

            if (res.ok) {
                toast.success(`Reacción ${emoji} enviada`);
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error ?? 'Error al enviar reacción');
            }
        } catch {
            toast.error('Error de conexión al enviar reacción');
        }
    }, [instance, selectedConv]);

    function handleQuickReplySelect(reply: { shortcut: string; message: string | null; media_url: string | null; media_type: string | null }) {
        let text = reply.message ?? '';
        const name = selectedConv?.contact.name ?? '';
        const phone = selectedConv?.channel_id.split('@')[0] ?? '';

        text = text.replace(/\{nombre\}/g, name).replace(/\{telefono\}/g, phone);

        setInput(text);
        setQuickReplyQuery(null);

        if (reply.media_url) {
            sendMessage({
                number: selectedConv!.channel_id.split('@')[0],
                text,
                channel_id: selectedConv!.channel_id,
                media_url: reply.media_url,
                media_type: reply.media_type ?? 'document',
            });
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

    async function handleAiReply() {
        if (!selectedConv) return;

        setAiGenerating(true);

        try {
            const recentMessages = messages.slice(-10).map((m) => ({
                role: m.input_output ? 'client' : 'agent',
                text: m.text || '[media]',
            }));

            const contactName =
                selectedConv.contact?.name ||
                selectedConv.contact?.phone ||
                selectedConv.channel_id;

            const res = await fetch('/admin/ai-agent/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    message: `Genera una respuesta breve y natural para ${contactName}. No uses markdown, solo texto plano.`,
                    conversation_context: {
                        contact_name: contactName,
                        contact_phone: selectedConv.channel_id.split('@')[0],
                        recent_messages: recentMessages,
                    },
                    page_context: {
                        url: window.location.pathname,
                        component: 'Chat',
                    },
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error ?? 'Error al generar respuesta con IA');
                return;
            }

            const data = await res.json();
            const aiText = data.message as string;

            if (aiText) {
                setAiDraft(aiText);
                toast.success('Respuesta generada');
            } else {
                toast.error('La IA no generó una respuesta');
            }

            console.log('AI response:', { ok: res.ok, aiText });
        } catch (err) {
            console.error('handleAiReply error:', err);
            toast.error('Error de conexión al generar respuesta con IA');
        } finally {
            setAiGenerating(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            if (quickReplyQuery !== null) {
                return;
            }

            if (quickReplyQuery !== null) {
                setQuickReplyQuery(null);
            }

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

                    await sendMessage({
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
                <ChatConversationList
                    conversations={conversations}
                    filteredConversations={filteredConversations}
                    loadingChats={loadingChats}
                    search={search}
                    setSearch={setSearch}
                    chatTab={chatTab}
                    setChatTab={setChatTab}
                    selectedConv={selectedConv}
                    onSelectConv={setSelectedConv}
                    instName={instName}
                    instInfo={instInfo}
                    conversationsCount={conversations.length}
                />

                <div className="flex flex-1 flex-col relative">
                    {selectedConv ? (
                        <>
                            <ChatHeader
                                connectionStatus={connectionStatus}
                                selectedConv={selectedConv}
                                msgSearch={msgSearch}
                                setMsgSearch={setMsgSearch}
                                onOpenSidebar={() => {
                                    setSidebarChannelId(selectedConv.channel_id);
                                    setSidebarContactId(selectedConv.contact_id);
                                }}
                            />

                            <div
                                ref={messagesContainerRef}
                                className={`flex-1 overflow-y-auto overflow-x-hidden relative ${dragOver ? 'ring-2 ring-primary' : ''}`}
                                onScroll={handleScroll}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
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
                                        {(() => {
                                            const reactionMap: Record<string, string> = {};
                                            const filteredMessages: typeof messages = [];

                                            for (const msg of messages) {
                                                if (msg.message_type === 'reactionMessage' && msg.reaction_to) {
                                                    reactionMap[msg.reaction_to] = msg.text ?? '👍';
                                                } else if (
                                                    !msgSearch
                                                    || (msg.text && msg.text.toLowerCase().includes(msgSearch.toLowerCase()))
                                                    || (msg.media_url && msg.message_type?.toLowerCase().includes(msgSearch.toLowerCase()))
                                                ) {
                                                    filteredMessages.push(msg);
                                                }
                                            }

                                            if (filteredMessages.length === 0 && msgSearch) {
                                                return (
                                                    <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
                                                        <MessageSquare className="size-8" />
                                                        <p className="text-sm">Sin resultados para "{msgSearch}"</p>
                                                    </div>
                                                );
                                            }

                                            return filteredMessages.map((msg) => {
                                                const isMe = msg.input_output === false;
                                                const isGroup = !!msg.sender_phone;
                                                const reaction = reactionMap[msg.message_id ?? ''];

                                                return (
                                                    <ChatMessageBubble
                                                        key={msg.id}
                                                        msg={msg}
                                                        isMe={isMe}
                                                        isGroup={isGroup}
                                                        reaction={reaction}
                                                        msgSearch={msgSearch}
                                                        onContextMenu={(e, m) => {
                                                            if (m.message_id && selectedConv) {
                                                                setContextMenu({ x: e.clientX, y: e.clientY, msg: m });
                                                            }
                                                        }}
                                                        onLightbox={setLightboxSrc}
                                                    />
                                                );
                                            });
                                        })()}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {!isAtBottom && (
                                <button
                                    type="button"
                                    onClick={scrollToBottom}
                                    className="absolute bottom-32 right-6 z-40 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
                                    title="Ir abajo"
                                >
                                    <span className="relative inline-flex">
                                        <ChevronDown className="size-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-2 -right-2 flex size-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            )}

                            <ChatInputFooter
                                input={input}
                                setInput={setInput}
                                sending={sending}
                                uploading={uploading}
                                recording={recording}
                                selectedConv={selectedConv}
                                quickReplyQuery={quickReplyQuery}
                                setQuickReplyQuery={setQuickReplyQuery}
                                aiGenerating={aiGenerating}
                                pickedFile={pickedFile}
                                setPickedFile={setPickedFile}
                                fileInputRef={fileInputRef}
                                showEmojiPicker={showEmojiPicker}
                                setShowEmojiPicker={setShowEmojiPicker}
                                onSendText={handleSendText}
                                onSendFile={handleSendFile}
                                onAiReply={() => setAiConfirmOpen(true)}
                                onToggleRecording={toggleRecording}
                                onQuickReplySelect={handleQuickReplySelect}
                                onKeyDown={handleKeyDown}
                            />
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
                    setDeleteDialog(selectedConv);
                    setSidebarChannelId(null);
                    setSidebarContactId(null);
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
                        lightboxSrc.endsWith('.pdf') ? (
                            <iframe
                                src={lightboxSrc}
                                className="h-[85vh] w-full max-w-4xl rounded-lg"
                            />
                        ) : lightboxSrc.match(/\.(mp4|webm|ogg|mov|avi)$/i) || lightboxSrc.includes('video') ? (
                            <video
                                src={lightboxSrc}
                                controls
                                autoPlay
                                className="max-h-[85vh] w-auto rounded-lg object-contain"
                            />
                        ) : (
                            <img
                                src={lightboxSrc}
                                alt=""
                                className="max-h-[85vh] w-auto rounded-lg object-contain"
                            />
                        )
                    )}
                </DialogContent>
            </Dialog>

            {contextMenu && (
                <>
                    <div
                        className="fixed inset-0 z-50"
                        onClick={() => setContextMenu(null)}
                        onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
                    />
                    <div
                        className="fixed z-50 flex items-center gap-1 rounded-xl border bg-card p-1.5 shadow-xl"
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                    >
                        {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                className="flex size-9 items-center justify-center rounded-lg text-xl hover:bg-muted transition-colors"
                                onClick={() => {
                                    sendReaction(contextMenu.msg, emoji);
                                    setContextMenu(null);
                                }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </>
            )}

            <Dialog open={aiConfirmOpen} onOpenChange={(open) => { if (!open) setAiConfirmOpen(false); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Responder con IA</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de generar una respuesta automática con IA para {selectedConv?.contact.name || selectedConv?.channel_id}?
                            Se generará una respuesta basada en el historial reciente de la conversación.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAiConfirmOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={() => {
                            setAiConfirmOpen(false);
                            handleAiReply();
                        }}>
                            Sí, generar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={aiDraft !== null} onOpenChange={(open) => { if (!open) setAiDraft(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Responder con IA</DialogTitle>
                        <DialogDescription>
                            Revisa la respuesta generada antes de enviarla.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted p-3 text-sm">
                        {aiDraft}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAiDraft(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={() => {
                            if (!aiDraft || !selectedConv) return;
                            const text = aiDraft;
                            setAiDraft(null);
                            sendMessage({
                                number: selectedConv.channel_id.split('@')[0],
                                text,
                                channel_id: selectedConv.channel_id,
                            });
                        }}>
                            Enviar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
