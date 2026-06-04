import { MessageSquare, Search, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { LocalConversation } from '@/types';

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

interface ChatConversationListProps {
    conversations: LocalConversation[];
    filteredConversations: LocalConversation[];
    loadingChats: boolean;
    search: string;
    setSearch: (val: string) => void;
    chatTab: 'unread' | 'read';
    setChatTab: (tab: 'unread' | 'read') => void;
    selectedConv: LocalConversation | null;
    onSelectConv: (conv: LocalConversation) => void;
    instName: string;
    instInfo: { config?: Record<string, string | undefined> | null } | undefined;
    conversationsCount: number;
}

export function ChatConversationList({
    conversations,
    filteredConversations,
    loadingChats,
    search,
    setSearch,
    chatTab,
    setChatTab,
    selectedConv,
    onSelectConv,
    instName,
    instInfo,
    conversationsCount,
}: ChatConversationListProps) {
    return (
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
                        {conversationsCount} conversaciones
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
                        className="h-8 pl-8 pr-8 text-sm"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-1 border-b px-2 py-1">
                <button
                    type="button"
                    onClick={() => setChatTab('unread')}
                    className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                        chatTab === 'unread'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                >
                    No leídos ({conversations.filter((c) => c.unread_count > 0).length})
                </button>
                <button
                    type="button"
                    onClick={() => setChatTab('read')}
                    className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                        chatTab === 'read'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                >
                    Leídos ({conversations.filter((c) => c.unread_count === 0).length})
                </button>
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
                                selectedConv?.channel_id === conv.channel_id ? 'bg-accent' : ''
                            }`}
                            onClick={() => onSelectConv(conv)}
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
    );
}
