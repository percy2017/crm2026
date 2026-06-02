import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { NotificationItem } from '@/types/notifications';

type NotificationsContextValue = {
    notifications: NotificationItem[];
    unreadCount: number;
    addNotification: (n: Omit<NotificationItem, 'id' | 'read' | 'count'>) => void;
    removeNotification: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const STORAGE_KEY = 'app_notifications';
const MAX_NOTIFICATIONS = 20;

function loadFromStorage(): NotificationItem[] {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as NotificationItem[];

        if (!raw.length) {
return [];
}

        if (!('count' in raw[0])) {
            localStorage.removeItem(STORAGE_KEY);

            return [];
        }

        return raw;
    } catch {
        return [];
    }
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<NotificationItem[]>(loadFromStorage);
    const persistTimer = useRef<ReturnType<typeof setTimeout>>();

    const persist = useCallback((items: NotificationItem[]) => {
        clearTimeout(persistTimer.current);
        persistTimer.current = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)));
            } catch {
                // ignore
            }
        }, 300);
    }, []);

    const addNotification = useCallback((n: Omit<NotificationItem, 'id' | 'read' | 'count'>) => {
        setNotifications((prev) => {
            const groupKey = `${n.instance}_${n.channel_id}`;
            const existing = prev.find((x) => x.id === groupKey);

            if (existing) {
                const updated: NotificationItem = {
                    ...existing,
                    message_preview: n.message_preview,
                    created_at: n.created_at,
                    count: existing.count + 1,
                    read: false,
                };
                const next = [updated, ...prev.filter((x) => x.id !== groupKey)].slice(0, MAX_NOTIFICATIONS);
                persist(next);

                return next;
            }

            const item: NotificationItem = { ...n, id: groupKey, read: false, count: 1 };
            const next = [item, ...prev].slice(0, MAX_NOTIFICATIONS);
            persist(next);

            return next;
        });
    }, [persist]);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => {
            const next = prev.filter((n) => n.id !== id);
            persist(next);

            return next;
        });
    }, [persist]);

    const markAllAsRead = useCallback(() => {
        setNotifications([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        const hasOldFormat = notifications.some((n) => !('count' in n));

        if (hasOldFormat) {
            markAllAsRead();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const handler = (e: CustomEvent<Omit<NotificationItem, 'id' | 'read' | 'count'>>) => {
            addNotification(e.detail);
        };

        window.addEventListener('notify:message' as any, handler as any);

        return () => {
            window.removeEventListener('notify:message' as any, handler as any);
        };
    }, [addNotification]);

    return (
        <NotificationsContext.Provider
            value={{ notifications, unreadCount, addNotification, removeNotification, markAllAsRead, clearAll }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications(): NotificationsContextValue {
    const ctx = useContext(NotificationsContext);

    if (!ctx) {
throw new Error('useNotifications must be used within NotificationsProvider');
}

    return ctx;
}
