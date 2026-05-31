import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

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

export default function WebChatIndex() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selected, setSelected] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchConversations = useCallback(() => {
        fetch('/admin/web-chat/conversations', {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.conversations) setConversations(data.conversations);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchConversations(); }, [fetchConversations]);

    const fetchMessages = useCallback((convId: number) => {
        fetch(`/admin/web-chat/conversations/${convId}/messages`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.messages) setMessages(data.messages);
            });
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSelect = (conv: Conversation) => {
        setSelected(conv);
        fetchMessages(conv.id);
    };

    const handleSend = async () => {
        if (!selected || !messageInput.trim()) return;
        const res = await fetch(`/admin/web-chat/conversations/${selected.id}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '',
                Accept: 'application/json',
            },
            body: JSON.stringify({ content: messageInput.trim() }),
        });
        if (res.ok) {
            setMessageInput('');
            fetchMessages(selected.id);
            fetchConversations();
        }
    };

    const handleAssign = async (conv: Conversation) => {
        await fetch(`/admin/web-chat/conversations/${conv.id}/assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '',
                Accept: 'application/json',
            },
            body: JSON.stringify({ user_id: 1 }),
        });
        fetchConversations();
    };

    const handleClose = async (conv: Conversation) => {
        await fetch(`/admin/web-chat/conversations/${conv.id}/close`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '',
                Accept: 'application/json',
            },
        });
        setSelected(null);
        fetchConversations();
    };

    const statusBadge = (status: string) => {
        const map: Record<string, 'secondary' | 'default' | 'outline'> = {
            pending: 'secondary',
            active: 'default',
            closed: 'outline',
        };
        return <Badge variant={map[status] ?? 'secondary'}>{status}</Badge>;
    };

    return (
        <>
            <Head title="Web Chat" />

            <div className="flex h-full flex-1 gap-4 rounded-xl p-4">
                <div className="flex w-80 flex-col rounded-xl border">
                    <div className="border-b p-3">
                        <h2 className="font-semibold">Conversations</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <p className="p-4 text-sm text-muted-foreground">Loading...</p>
                        ) : conversations.length === 0 ? (
                            <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    className={`w-full border-b p-3 text-left transition-colors hover:bg-accent ${selected?.id === conv.id ? 'bg-accent' : ''}`}
                                    onClick={() => handleSelect(conv)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium truncate">
                                            {conv.visitor.name}
                                        </span>
                                        {conv.unread_count > 0 && (
                                            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                        {statusBadge(conv.status)}
                                        <span>{conv.widget.name}</span>
                                    </div>
                                    {conv.last_message && (
                                        <p className="mt-1 truncate text-xs text-muted-foreground">
                                            {conv.last_message}
                                        </p>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex flex-1 flex-col rounded-xl border">
                    {selected ? (
                        <>
                            <div className="flex items-center justify-between border-b p-3">
                                <div>
                                    <h3 className="font-semibold text-sm">{selected.visitor.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {selected.visitor.current_page ?? ''}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {!selected.assigned_user && (
                                        <Button variant="outline" size="sm" onClick={() => handleAssign(selected)}>
                                            Assign to me
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => handleClose(selected)}>
                                        Close
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-8">
                                        No messages yet. Wait for the visitor to send a message.
                                    </p>
                                ) : (
                                    messages.map((m) => (
                                        <div key={m.id} className={`flex ${m.is_from_visitor ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${m.is_from_visitor ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                                                <p>{m.content}</p>
                                                <p className="mt-1 text-[10px] opacity-70">
                                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="flex gap-2 border-t p-3">
                                <Input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a message..."
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                                />
                                <Button onClick={handleSend}>Send</Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                            Select a conversation to start chatting.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
