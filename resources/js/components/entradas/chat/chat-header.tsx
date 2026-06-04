import { Phone, Search, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import type { LocalConversation } from '@/types';

interface ChatHeaderProps {
    connectionStatus: string | undefined;
    selectedConv: LocalConversation | null;
    msgSearch: string;
    setMsgSearch: (val: string) => void;
    onOpenSidebar: () => void;
}

export function ChatHeader({
    connectionStatus,
    selectedConv,
    msgSearch,
    setMsgSearch,
    onOpenSidebar,
}: ChatHeaderProps) {
    return (
        <>
            {connectionStatus && connectionStatus !== 'open' && (
                <div className={`px-3 py-1.5 text-xs font-medium ${
                    connectionStatus === 'stale'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        : connectionStatus === 'connecting'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                    {connectionStatus === 'stale' && '⚠️ No se han recibido mensajes en los últimos minutos'}
                    {connectionStatus === 'connecting' && '🔄 Reconectando...'}
                    {connectionStatus === 'disconnected' && '🔌 Desconectado — escanea el código QR'}
                    {connectionStatus === 'removed' && '❌ Instancia eliminada — crea una nueva'}
                    {connectionStatus === 'closed' && '🔴 Conexión cerrada'}
                </div>
            )}

            {selectedConv && (
                <div className="flex items-center gap-3 border-b p-3">
                    <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3"
                        onClick={onOpenSidebar}
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
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar..."
                            value={msgSearch}
                            onChange={(e) => setMsgSearch(e.target.value)}
                            className="h-8 w-32 rounded-md pl-7 text-xs md:w-40"
                        />
                        {msgSearch && (
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setMsgSearch('')}
                            >
                                <X className="size-3" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}