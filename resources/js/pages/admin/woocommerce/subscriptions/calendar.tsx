import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, User, ShoppingBag, TicketPercent, CreditCard, Send, Loader2, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { WooOrder } from '@/types';

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function avatarColor(name: string): string {
    const colors = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
        'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
        'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
        'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
        'bg-rose-500',
    ];
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}

type CalendarEvent = {
    id: number;
    title: string;
    start: string;
    end: string;
    order_number: string;
    total: string;
    customer_name: string;
};

type Props = {
    events: CalendarEvent[];
};

type InboxOption = {
    id: number;
    name: string;
    type: string;
};

export default function SubscriptionCalendarPage({ events }: Props) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [order, setOrder] = useState<WooOrder | null>(null);
    const [loading, setLoading] = useState(false);
    const [picSrc, setPicSrc] = useState<string | undefined>();
    const [tab, setTab] = useState<'detail' | 'send'>('detail');

    const [contactDetail, setContactDetail] = useState<{ name: string; phone: string; whatsapp_id: string | null } | null>(null);
    const [loadingContact, setLoadingContact] = useState(false);
    const [inboxes, setInboxes] = useState<InboxOption[]>([]);
    const [loadingInboxes, setLoadingInboxes] = useState(false);
    const [selectedInbox, setSelectedInbox] = useState('');
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);

    const handleEventClick = async (id: number) => {
        setSelectedId(id);
        setLoading(true);
        setPicSrc(undefined);
        setTab('detail');
        setContactDetail(null);
        setSelectedInbox('');
        setMessageText('');

        try {
            const res = await fetch(`/admin/woocommerce/orders/${id}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });

            if (res.ok) {
                const json = await res.json();
                setOrder(json.data);
                setPicSrc(json.data.contact_profile_pic_url ?? undefined);
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    const loadSendData = async () => {
        if (!order?.contact_id) {
return;
}

        setLoadingContact(true);
        setLoadingInboxes(true);

        try {
            const [contactRes, inboxRes] = await Promise.all([
                fetch(`/admin/contacts/${order.contact_id}`, {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                }),
                fetch('/admin/inboxes/list', {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                }),
            ]);

            if (contactRes.ok) {
                const contact = await contactRes.json();
                setContactDetail({
                    name: contact.name ?? order.contact_name ?? '',
                    phone: contact.phone ?? '',
                    whatsapp_id: contact.whatsapp_id ?? null,
                });
            }

            if (inboxRes.ok) {
                const list = await inboxRes.json() as InboxOption[];
                setInboxes(list);

                if (list.length === 1) {
                    setSelectedInbox(list[0].name);
                }
            }
        } catch {
            setInboxes([]);
        } finally {
            setLoadingContact(false);
            setLoadingInboxes(false);
        }
    };

    useEffect(() => {
        if (tab === 'send' && order?.contact_id) {
            setInboxes([]);
            loadSendData();
        }
    }, [tab, order?.contact_id]);

    const handleSend = async () => {
        if (!selectedInbox || !messageText.trim() || !contactDetail?.phone) {
return;
}

        setSending(true);

        try {
            const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

            const res = await fetch(`/admin/entradas/${selectedInbox}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    number: contactDetail.phone,
                    text: messageText.trim(),
                }),
            });

            if (res.ok) {
                toast.success('Mensaje enviado correctamente');
                setMessageText('');
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error ?? 'Error al enviar mensaje');
            }
        } catch {
            toast.error('Error de conexión al enviar mensaje');
        } finally {
            setSending(false);
        }
    };

    const handleGoToChat = () => {
        if (!selectedInbox || !contactDetail) {
return;
}

        const channelId = contactDetail.whatsapp_id ?? `${contactDetail.phone}@s.whatsapp.net`;
        router.visit(`/admin/entradas/${selectedInbox}?channel_id=${encodeURIComponent(channelId)}`);
    };

    return (
        <>
            <Head title="Calendario de Suscripciones — WooCommerce" />

            <div className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                    <Link href="/admin/woocommerce/pos">
                        <Button variant="ghost" size="icon" className="size-8">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Calendario de Suscripciones</h1>
                </div>

                <div className="rounded-xl border bg-card p-4">
                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        locale="es"
                        events={events.map((e) => ({
                            id: String(e.id),
                            title: `${e.title}${e.customer_name ? ` — ${e.customer_name}` : ''}`,
                            start: e.end,
                            end: e.end,
                            extendedProps: e,
                        }))}
                        eventClick={(info) => {
                            const ext = info.event.extendedProps as CalendarEvent;
                            handleEventClick(ext.id);
                        }}
                        eventContent={(arg) => (
                            <div className="px-1 py-0.5 text-xs">{arg.event.title}</div>
                        )}
                        height="auto"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek',
                        }}
                        buttonText={{
                            today: 'Hoy',
                            month: 'Mes',
                            week: 'Semana',
                        }}
                        noEventsText="No hay suscripciones"
                    />
                </div>
            </div>

            <Sheet open={selectedId !== null} onOpenChange={(o) => {
                if (!o) {
                    setSelectedId(null);
                    setOrder(null);
                    setPicSrc(undefined);
                    setTab('detail');
                    setContactDetail(null);
                    setInboxes([]);
                    setSelectedInbox('');
                    setMessageText('');
                }
            }}>
                <SheetContent side="right" className="w-full max-w-md sm:max-w-lg overflow-y-auto p-0">
                    {loading && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-muted-foreground animate-pulse">Cargando detalles...</p>
                        </div>
                    )}

                    {!loading && order && (
                        <>
                            <div className="sticky top-0 z-10 border-b bg-card px-6 py-4">
                                <SheetHeader className="text-left">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="min-w-0">
                                                <SheetTitle className="text-lg truncate">
                                                    Orden <span className="text-primary">#{order.number}</span>
                                                </SheetTitle>
                                                <SheetDescription>
                                                    Creada el {new Date(order.date_created).toLocaleDateString('es', {
                                                        year: 'numeric', month: 'long', day: 'numeric',
                                                    })}
                                                </SheetDescription>
                                            </div>
                                        </div>
                                        <Badge className={'shrink-0 ' + (STATUS_COLORS[order.status] ?? '')}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </SheetHeader>
                            </div>

                            <div className="flex border-b">
                                <button
                                    className={`flex-1 px-4 py-2.5 text-sm font-medium text-center transition-colors ${
                                        tab === 'detail'
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={() => setTab('detail')}
                                >
                                    Detalle
                                </button>
                                <button
                                    className={`flex-1 px-4 py-2.5 text-sm font-medium text-center transition-colors ${
                                        tab === 'send'
                                            ? 'border-b-2 border-primary text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={() => setTab('send')}
                                >
                                    Enviar Mensaje
                                </button>
                            </div>

                            {tab === 'detail' && (
                                <div className="px-6 py-4 space-y-6">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Total</p>
                                            <p className="text-lg font-bold text-primary">{order.currency} {order.total}</p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Método de pago</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <CreditCard className="size-3.5 text-muted-foreground" />
                                                <p className="text-sm font-medium truncate">{order.payment_method_title}</p>
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Subtotal</p>
                                            <p className="text-sm font-medium">{order.currency} {order.subtotal}</p>
                                        </div>
                                        {order.discount_total !== '0.00' && (
                                            <div className="rounded-lg bg-muted/50 p-3">
                                                <p className="text-xs text-muted-foreground">Descuento</p>
                                                <p className="text-sm font-medium text-red-500">-{order.currency} {order.discount_total}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CalendarDays className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suscripción</p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                                            <p className="text-sm font-bold">{order.subscription_meta?.title ?? 'Suscripción'}</p>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                                {order.subscription_meta?.start_date && (
                                                    <div>
                                                        <span className="block">Inicio</span>
                                                        <span className="font-medium text-foreground">
                                                            {new Date(order.subscription_meta.start_date).toLocaleDateString('es')}
                                                        </span>
                                                    </div>
                                                )}
                                                {order.subscription_meta?.end_date && (
                                                    <div>
                                                        <span className="block">Fin</span>
                                                        <span className="font-medium text-foreground">
                                                            {new Date(order.subscription_meta.end_date).toLocaleDateString('es')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {order.billing?.first_name && (
                                        <div className="border-t pt-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <User className="size-4 text-muted-foreground" />
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Avatar className="size-12 shrink-0">
                                                    <AvatarImage src={picSrc} alt={order.billing.first_name + ' ' + (order.billing.last_name ?? '')} />
                                                    <AvatarFallback className={avatarColor(order.billing.first_name + ' ' + (order.billing.last_name ?? '')) + ' text-white text-base font-bold'}>
                                                        {getInitials(order.billing.first_name + ' ' + (order.billing.last_name ?? ''))}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1 text-sm min-w-0">
                                                    <p className="font-medium">
                                                        {order.billing.first_name} {order.billing.last_name}
                                                    </p>
                                                    {order.billing.email && (
                                                        <p className="text-muted-foreground">{order.billing.email}</p>
                                                    )}
                                                    {order.billing.phone && (
                                                        <p className="text-muted-foreground">{order.billing.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {order.line_items && order.line_items.length > 0 && (
                                        <div className="border-t pt-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <ShoppingBag className="size-4 text-muted-foreground" />
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Productos ({order.line_items.length})
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                {order.line_items.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm truncate">{item.name}</p>
                                                            <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                                                        </div>
                                                        <span className="text-sm font-medium tabular-nums shrink-0 ml-2">
                                                            {order.currency} {item.total}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {order.coupon_lines && order.coupon_lines.length > 0 && (
                                        <div className="border-t pt-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TicketPercent className="size-4 text-muted-foreground" />
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cupones</p>
                                            </div>
                                            <div className="space-y-1">
                                                {order.coupon_lines.map((c) => (
                                                    <div key={c.id} className="flex items-center justify-between text-sm bg-muted/20 rounded-lg px-3 py-2">
                                                        <span className="font-medium">{c.code}</span>
                                                        <span className="text-red-500 text-xs">-{c.discount}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {tab === 'send' && (
                                <div className="px-6 py-4 space-y-4">
                                    {loadingContact || loadingInboxes ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : !order.contact_id ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            Esta orden no tiene un contacto vinculado en el CRM.
                                        </p>
                                    ) : contactDetail ? (
                                        <>
                                            <div className="rounded-lg bg-muted/30 p-3">
                                                <p className="text-xs text-muted-foreground">Contacto</p>
                                                <p className="text-sm font-medium mt-0.5">{contactDetail.name}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{contactDetail.phone}</p>
                                            </div>

                                            {inboxes.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-8">
                                                    No hay inboxes activos disponibles.
                                                </p>
                                            ) : (
                                                <><div>
                                                    <Label className="text-xs font-semibold text-muted-foreground">Inbox</Label>
                                                    <select
                                                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        value={selectedInbox}
                                                        onChange={(e) => setSelectedInbox(e.target.value)}
                                                    >
                                                        <option value="">Seleccionar inbox...</option>
                                                        {inboxes.map((inb) => (
                                                            <option key={inb.id} value={inb.name}>
                                                                {inb.type === 'evolution' ? '📱 WhatsApp - ' : '🌐 Web - '}{inb.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <Label className="text-xs font-semibold text-muted-foreground">Mensaje</Label>
                                                    <Textarea
                                                        className="mt-1 min-h-[120px] resize-none"
                                                        placeholder="Escribe tu mensaje aquí..."
                                                        value={messageText}
                                                        onChange={(e) => setMessageText(e.target.value)}
                                                    />
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        className="flex-1"
                                                        disabled={!selectedInbox || !messageText.trim() || sending}
                                                        onClick={handleSend}
                                                    >
                                                        {sending ? (
                                                            <Loader2 className="size-4 mr-1.5 animate-spin" />
                                                        ) : (
                                                            <Send className="size-4 mr-1.5" />
                                                        )}
                                                        Enviar Mensaje
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        disabled={!selectedInbox}
                                                        onClick={handleGoToChat}
                                                    >
                                                        <MessageSquare className="size-4 mr-1.5" />
                                                        Ir al Chat
                                                    </Button>
                                                </div></>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No se pudo obtener la información del contacto.
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

const STATUS_COLORS: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'on-hold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    failed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800',
};