import { router } from '@inertiajs/react';
import { Bell, CheckCheck, MessageSquare, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/notifications-context';
import type { NotificationItem } from '@/types/notifications';

function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) {
return 'Ahora';
}

    if (mins < 60) {
return `Hace ${mins}m`;
}

    const hours = Math.floor(mins / 60);

    if (hours < 24) {
return `Hace ${hours}h`;
}

    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function NotificationRow({ item }: { item: NotificationItem }) {
    const { removeNotification } = useNotifications();

    return (
        <button
            type="button"
            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${item.read ? '' : 'bg-accent/30'}`}
            onClick={() => {
                removeNotification(item.id);
                router.visit(`/admin/entradas/${item.instance}`);
            }}
        >
            <Avatar className="mt-0.5 size-9 shrink-0">
                <AvatarImage src={item.contact_avatar ?? undefined} />
                <AvatarFallback className="text-xs">
                    {(item.contact_name ?? '?').charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <p className="truncate text-sm font-medium">
                            {item.contact_name || 'Desconocido'}
                        </p>
                        {item.count > 1 && (
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted-foreground/20 text-[9px] font-medium text-muted-foreground">
                                {item.count}
                            </span>
                        )}
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatTime(item.created_at)}
                    </span>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                    {item.message_preview}
                </p>
            </div>
        </button>
    );
}

type Props = {
    open: boolean;
    onClose: () => void;
};

export function NotificationsSheet({ open, onClose }: Props) {
    const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();
    const panelRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
onClose();
}
    }, [onClose]);

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, handleKeyDown]);

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-50 flex justify-end"
                    onClick={(e) => {
 if (e.target === e.currentTarget) {
onClose();
} 
}}
                >
                    <div
                        className="absolute inset-0 bg-black/50 animate-in fade-in-0"
                        onClick={onClose}
                    />
                    <div
                        ref={panelRef}
                        className="relative z-50 flex h-full w-full max-w-md flex-col bg-background shadow-xl animate-in slide-in-from-right"
                    >
                        <div className="sticky top-0 z-10 border-b bg-card px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell className="size-5 text-muted-foreground" />
                                    <p className="text-lg font-semibold">Notificaciones</p>
                                    {unreadCount > 0 && (
                                        <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {unreadCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            onClick={markAllAsRead}
                                            title="Marcar todo como leído"
                                        >
                                            <CheckCheck className="size-4" />
                                        </Button>
                                    )}
                                    {notifications.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-destructive"
                                            onClick={clearAll}
                                            title="Limpiar todas"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        onClick={onClose}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
                                    <MessageSquare className="size-8" />
                                    <p className="text-sm">Sin notificaciones</p>
                                    <p className="text-xs">Los nuevos mensajes aparecerán aquí</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {notifications.map((item) => (
                                        <NotificationRow key={item.id} item={item} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
