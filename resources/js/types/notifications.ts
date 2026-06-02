export type NotificationItem = {
    id: string;
    channel_id: string;
    instance: string;
    contact_name: string | null;
    contact_avatar: string | null;
    message_preview: string;
    created_at: string;
    read: boolean;
    count: number;
};
