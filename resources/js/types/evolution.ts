export type EvolutionInstance = {
    id: string;
    name: string;
    connectionStatus: 'open' | 'connecting' | 'close' | 'pending';
    ownerJid: string | null;
    profileName: string | null;
    profilePicUrl: string | null;
    integration: string;
    number: string | null;
    token: string;
    clientName: string;
    disconnectionReasonCode: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
        Message: number;
        Contact: number;
        Chat: number;
    };
};

export type EvolutionWebhook = {
    id: number;
    instance: string | null;
    event: string | null;
    payload: Record<string, unknown>;
    created_at: string;
};

export type LocalConversation = {
    id: number;
    contact_id: number | null;
    channel_id: string;
    unread_count: number;
    contact: {
        name: string | null;
        phone: string | null;
        profile_pic_url: string | null;
    };
    last_message: {
        text: string | null;
        created_at: string;
    } | null;
};

export type LocalMessage = {
    id: number;
    channel_id: string;
    message_id: string | null;
    input_output: boolean;
    message_type: string | null;
    text: string | null;
    media_url: string | null;
    created_at: string;
    sender_phone: string | null;
    sender_name: string | null;
    sender_avatar: string | null;
    reaction_to: string | null;
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | null;
};

export type EvolutionChat = {
    remoteJid: string;
    pushName: string;
    profilePicUrl: string | null;
    lastMessage: {
        text: string;
        timestamp: number;
    } | null;
    unreadCount: number;
};

export type EvolutionMessage = {
    key: {
        id: string;
        remoteJid: string;
        fromMe: boolean;
    };
    message: {
        conversation?: string;
        extendedTextMessage?: {
            text: string;
        };
        imageMessage?: {
            url: string;
            mimetype: string;
        };
    };
    messageTimestamp: number;
    pushName: string;
    participant?: string;
};

