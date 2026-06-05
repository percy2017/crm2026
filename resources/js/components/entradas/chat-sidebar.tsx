import {
    Copy,
    Download,
    FileText,
    Image,
    Pencil,
    Phone,
    ShoppingCart,
    Trash2,
    BarChart3,
    CalendarDays,
    MessageSquare,
    ArrowUp,
    ArrowDown,
    Paperclip,
    Clock,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { show as adminContactsShow } from '@/routes/admin/contacts';
import type { LocalMessage } from '@/types';

type ContactDetail = {
    id: number;
    name: string | null;
    phone: string | null;
    whatsapp_id: string | null;
    email: string | null;
    notes: string | null;
    profile_pic_url: string | null;
    is_business: boolean;
    wa_status: string | null;
    country: string | null;
    website: string[] | null;
    instance: string | null;
    type: string;
};

type Props = {
    channelId: string | null;
    contactId: number | null;
    contactPhone?: string | null;
    contactName?: string | null;
    contactAvatar?: string | null;
    messages: LocalMessage[];
    onClose: () => void;
    onDelete?: () => void;
};

type WooOrder = {
    id: number;
    number: string;
    total: string;
    status: string;
    date_created: string;
};

function getCountryFlag(country: string | null): string {
    if (!country) {
        return '';
    }

    const codePoints = country
        .toUpperCase()
        .split('')
        .map((ch) => 127397 + ch.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
}

function getFileIcon(mimeType: string | null): string {
    if (!mimeType) {
        return '📄';
    }

    if (mimeType.startsWith('image/')) {
        return '🖼';
    }

    if (mimeType.startsWith('audio/')) {
        return '🎵';
    }

    if (mimeType.startsWith('video/')) {
        return '🎬';
    }

    return '📄';
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);

    return d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) {
return 'ahora';
}

    if (mins < 60) {
return `hace ${mins} min`;
}

    const hours = Math.floor(mins / 60);

    if (hours < 24) {
return `hace ${hours}h`;
}

    const days = Math.floor(hours / 24);

    return `hace ${days}d`;
}

const STATUS_COLORS: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'on-hold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '';
}

export default function ChatSidebar({ channelId, contactId, contactPhone, contactName, contactAvatar, messages, onClose, onDelete }: Props) {
    const [contact, setContact] = useState<ContactDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<WooOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const sharedMedia = messages.filter((m) => m.media_url);

    const totalMessages = messages.length;
    const sentCount = messages.filter((m) => !m.input_output).length;
    const receivedCount = messages.filter((m) => m.input_output).length;
    const fileCount = sharedMedia.length;
    const firstMsg = messages[0]?.created_at ?? null;
    const lastMsg = messages[messages.length - 1]?.created_at ?? null;

    useEffect(() => {
        if (!contactId) {
            setContact(null);

            return;
        }

        setLoading(true);
        fetch(adminContactsShow({ contact: contactId }).url, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setContact(data))
            .catch(() => setContact(null))
            .finally(() => setLoading(false));
    }, [contactId]);

    useEffect(() => {
        const phone = contact?.phone ?? contactPhone;

        if (!phone || phone === '—') {
            setOrders([]);

            return;
        }

        setOrdersLoading(true);

        fetch(`/admin/woocommerce/orders?search=${encodeURIComponent(phone)}&per_page=5`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
        })
            .then((res) => (res.ok ? res.json() : { data: [] }))
            .then((json) => setOrders(Array.isArray(json.data) ? json.data : []))
            .catch(() => setOrders([]))
            .finally(() => setOrdersLoading(false));
    }, [contact, contactPhone]);

    const isOpen = channelId !== null;

    const displayName = contact?.name ?? contactName ?? channelId ?? '—';
    const displayPhone = contact?.phone ?? contact?.whatsapp_id ?? contactPhone ?? '—';
    const displayAvatar = contact?.profile_pic_url ?? contactAvatar;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <SheetContent side="right" className="flex w-full max-w-md flex-col p-0 sm:max-w-lg">
                <div className="sticky top-0 z-10 border-b bg-card">
                    <SheetHeader className="px-6 py-4 text-left">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-14 shrink-0">
                                <AvatarImage src={displayAvatar ?? undefined} />
                                <AvatarFallback className="text-lg">
                                    {(displayName ?? '?').charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <SheetTitle className="truncate text-lg">
                                    {displayName}
                                </SheetTitle>
                                <SheetDescription className="flex items-center gap-2">
                                    <Phone className="size-3 shrink-0" />
                                    <span className="truncate text-xs">{displayPhone}</span>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(displayPhone);
                                            toast.success('Teléfono copiado');
                                        }}
                                        className="shrink-0 text-muted-foreground hover:text-foreground"
                                        title="Copiar"
                                    >
                                        <Copy className="size-3" />
                                    </button>
                                </SheetDescription>
                                {contact && (
                                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                                        <span>✉ {contact.email || '—'}</span>
                                        <span>
                                            {contact.country
                                                ? `${getCountryFlag(contact.country)} ${contact.country}`
                                                : '🌐 —'}
                                        </span>
                                        <span className="truncate max-w-[180px]" title={contact.whatsapp_id ?? ''}>
                                            🆔 {contact.whatsapp_id || '—'}
                                        </span>
                                    </div>
                                )}
                                {contact && (
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <a
                                            href={`/admin/contacts/${contact.id}/edit`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-accent"
                                        >
                                            <Pencil className="size-2.5" />
                                            Editar contacto
                                        </a>
                                    </div>
                                )}
                                {contact?.is_business && (
                                    <Badge variant="secondary" className="mt-1 text-[10px]">
                                        Business
                                    </Badge>
                                )}
                            </div>
                            </div>
                    </SheetHeader>
                </div>

                {loading && (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="animate-pulse text-sm text-muted-foreground">Cargando...</p>
                    </div>
                )}

                {!loading && contact && (
                    <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
                        {/* Statistics */}
                        <div>
                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <BarChart3 className="size-3.5" />
                                Estadísticas
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="rounded-lg bg-muted/50 p-2 text-center">
                                    <MessageSquare className="mx-auto mb-0.5 size-3.5 text-muted-foreground" />
                                    <p className="text-sm font-bold">{totalMessages}</p>
                                    <p className="text-[10px] text-muted-foreground">Total</p>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-2 text-center">
                                    <ArrowUp className="mx-auto mb-0.5 size-3.5 text-muted-foreground" />
                                    <p className="text-sm font-bold">{sentCount}</p>
                                    <p className="text-[10px] text-muted-foreground">Enviados</p>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-2 text-center">
                                    <ArrowDown className="mx-auto mb-0.5 size-3.5 text-muted-foreground" />
                                    <p className="text-sm font-bold">{receivedCount}</p>
                                    <p className="text-[10px] text-muted-foreground">Recibidos</p>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-2 text-center">
                                    <Paperclip className="mx-auto mb-0.5 size-3.5 text-muted-foreground" />
                                    <p className="text-sm font-bold">{fileCount}</p>
                                    <p className="text-[10px] text-muted-foreground">Archivos</p>
                                </div>
                            </div>
                            {firstMsg && lastMsg && (
                                <div className="mt-2 space-y-1 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarDays className="size-3" />
                                        Inicio: {formatDate(firstMsg)}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="size-3" />
                                        Último: {timeAgo(lastMsg)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* WooCommerce Orders */}
                        {orders.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <ShoppingCart className="size-3.5" />
                                    WooCommerce
                                </div>
                                <div className="space-y-2">
                                    {orders.map((order) => (
                                        <a
                                            key={order.id}
                                            href={`/admin/woocommerce/orders/${order.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">#{order.number}</span>
                                                <Badge className={`text-[10px] ${STATUS_COLORS[order.status] ?? ''}`}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <span className="text-sm">Bs. {order.total}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        {ordersLoading && (
                            <Skeleton className="h-12 w-full" />
                        )}

                        {sharedMedia.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Image className="size-3.5" />
                                    Archivos compartidos
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {sharedMedia.map((msg) => (
                                        <a
                                            key={msg.id}
                                            href={msg.media_url!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group size-16 shrink-0 overflow-hidden rounded-lg bg-muted/50"
                                        >
                                            {msg.message_type === 'imageMessage' || msg.message_type === 'stickerMessage' ? (
                                                <img
                                                    src={msg.media_url!}
                                                    alt=""
                                                    className="size-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex size-full flex-col items-center justify-center gap-0.5 p-1 text-center">
                                                    <span className="text-lg">
                                                        {getFileIcon(msg.message_type)}
                                                    </span>
                                                    <span className="truncate text-[9px] text-muted-foreground">
                                                        {msg.text || 'Archivo'}
                                                    </span>
                                                </div>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {contact.notes && (
                            <div>
                                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <FileText className="size-3.5" />
                                    Notas
                                </div>
                                <div className="rounded-lg bg-muted/30 p-3 text-sm">
                                    {contact.notes}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!loading && !contact && contactName && (
                    <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
                        {/* Statistics - also show for unknown contacts */}
                        <div>
                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <BarChart3 className="size-3.5" />
                                Estadísticas
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="rounded-lg bg-muted/50 p-2 text-center">
                                    <MessageSquare className="mx-auto mb-0.5 size-3.5 text-muted-foreground" />
                                    <p className="text-sm font-bold">{totalMessages}</p>
                                    <p className="text-[10px] text-muted-foreground">Total</p>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-2 text-center">
                                    <ArrowUp className="mx-auto mb-0.5 size-3.5 text-muted-foreground" />
                                    <p className="text-sm font-bold">{sentCount}</p>
                                    <p className="text-[10px] text-muted-foreground">Enviados</p>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-2 text-center">
                                    <ArrowDown className="mx-auto mb-0.5 size-3.5 text-muted-foreground" />
                                    <p className="text-sm font-bold">{receivedCount}</p>
                                    <p className="text-[10px] text-muted-foreground">Recibidos</p>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-2 text-center">
                                    <Paperclip className="mx-auto mb-0.5 size-3.5 text-muted-foreground" />
                                    <p className="text-sm font-bold">{fileCount}</p>
                                    <p className="text-[10px] text-muted-foreground">Archivos</p>
                                </div>
                            </div>
                            {firstMsg && lastMsg && (
                                <div className="mt-2 space-y-1 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarDays className="size-3" />
                                        Inicio: {formatDate(firstMsg)}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="size-3" />
                                        Último: {timeAgo(lastMsg)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* WooCommerce Orders for unknown contact */}
                        {orders.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <ShoppingCart className="size-3.5" />
                                    WooCommerce
                                </div>
                                <div className="space-y-2">
                                    {orders.map((order) => (
                                        <a
                                            key={order.id}
                                            href={`/admin/woocommerce/orders/${order.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">#{order.number}</span>
                                                <Badge className={`text-[10px] ${STATUS_COLORS[order.status] ?? ''}`}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <span className="text-sm">Bs. {order.total}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        {ordersLoading && (
                            <Skeleton className="h-12 w-full" />
                        )}

                        {sharedMedia.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Image className="size-3.5" />
                                    Archivos compartidos
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {sharedMedia.map((msg) => (
                                        <a
                                            key={msg.id}
                                            href={msg.media_url!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group size-16 shrink-0 overflow-hidden rounded-lg bg-muted/50"
                                        >
                                            {msg.message_type === 'imageMessage' || msg.message_type === 'stickerMessage' ? (
                                                <img
                                                    src={msg.media_url!}
                                                    alt=""
                                                    className="size-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex size-full flex-col items-center justify-center gap-0.5 p-1 text-center">
                                                    <span className="text-lg">
                                                        {getFileIcon(msg.message_type)}
                                                    </span>
                                                    <span className="truncate text-[9px] text-muted-foreground">
                                                        {msg.text || 'Archivo'}
                                                    </span>
                                                </div>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="sticky bottom-0 border-t bg-card p-4">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                const text = messages
                                    .map((m) => {
                                        const date = new Date(m.created_at).toLocaleString('es');
                                        const dir = m.input_output ? '←' : '→';
                                        const content = m.text ?? '';
                                        const media = m.media_url ? `\n   📎 ${m.media_url}` : '';

                                        return `[${date}] ${dir} ${content}${media}`;
                                    })
                                    .join('\n');
                                const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');

                                a.href = url;
                                a.download = `chat-${displayName}-${new Date().toISOString().slice(0, 10)}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                        >
                            <Download className="mr-2 size-4" />
                            Descargar chat
                        </Button>
                        {onDelete && (
                            <Button variant="ghost" className="flex-1 text-destructive hover:text-destructive" onClick={onDelete}>
                                <Trash2 className="mr-2 size-4" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}