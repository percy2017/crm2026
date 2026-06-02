import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    unreadCount: number;
    onClick: () => void;
};

export function NotificationBell({ unreadCount, onClick }: Props) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative size-8 shrink-0"
            onClick={onClick}
            title="Notificaciones"
        >
            <Bell className="size-4" />
            {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Button>
    );
}
