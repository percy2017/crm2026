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

