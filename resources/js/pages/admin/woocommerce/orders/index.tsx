import { Head, Link, router } from '@inertiajs/react';
import {
    ShoppingBag,
    User,
    CreditCard,
    CalendarDays,
    MapPin,
    TicketPercent,
    Package,
    Trash2,
    Store,
    Search,
    Send,
    MessageSquare,
    Loader2,
} from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import type { WooOrder, WooPaginatedResponse } from '@/types';

const STATUS_OPTIONS = ['', 'pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'];

const STATUS_COLORS: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'on-hold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    failed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? ''}`}
        >
            {status}
        </span>
    );
}

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

export default function WooOrdersIndex() {
    const [orders, setOrders] = useState<WooOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [status, setStatus] = useState('');

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [order, setOrder] = useState<WooOrder | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [picSrc, setPicSrc] = useState<string | undefined>();
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);
    const { confirm, dialogProps } = useConfirmDialog();
    const [tab, setTab] = useState<'detail' | 'send'>('detail');
    const [inboxes, setInboxes] = useState<Array<{ id: number; name: string; type: string }>>([]);
    const [loadingInboxes, setLoadingInboxes] = useState(false);
    const [selectedInbox, setSelectedInbox] = useState('');
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);

    const fetchOrders = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams({ per_page: String(perPage), page: String(page) });

        if (status) {
params.set('status', status);
}

        if (search) {
            params.set('search', search);
        }

        fetch(`/admin/woocommerce/orders?${params}`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : Promise.reject('Failed to load')))
            .then((json: WooPaginatedResponse<WooOrder>) => {
                setOrders(json.data);
                setTotalResults(json.meta.total_results);
                setTotalPages(json.meta.total_pages);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page, status, perPage, search]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleRowClick = async (id: number) => {
        setSelectedId(id);
        setLoadingDetail(true);
        setPicSrc(undefined);

        try {
            const res = await fetch(`/admin/woocommerce/orders/${id}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (res.ok) {
                const json = await res.json();
                setOrder(json.data);
                setPicSrc(json.data.contact_profile_pic_url ?? undefined);
            }
        } catch {
            // ignore
        } finally {
            setLoadingDetail(false);
        }
    };

    const customerName = (o: WooOrder) =>
        o.billing?.first_name ? `${o.billing.first_name} ${o.billing.last_name}`.trim() : '';

    const handleDelete = () => {
        if (!order) {
return;
}

        confirm(
            async () => {
                try {
                    const res = await fetch(`/admin/woocommerce/orders/${order.id}`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                            'Accept': 'application/json',
                        },
                    });

                    if (!res.ok) {
throw new Error((await res.json()).error ?? 'Error al eliminar');
}

                    setSelectedId(null);
                    setOrder(null);
                    setPicSrc(undefined);
                    fetchOrders();
                } catch {
                    // error handled silently
                }
            },
            'Eliminar orden',
            `¿Estás seguro de eliminar la orden #${order.number}?`,
        );
    };

    useEffect(() => {
        if (tab === 'send' && order?.contact_id) {
            setLoadingInboxes(true);
            setSelectedInbox('');
            setMessageText('');
            fetch('/admin/inboxes/list', {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            })
                .then((res) => {
                    if (!res.ok) return [];
                    return res.json() as Promise<Array<{ id: number; name: string; type: string }>>;
                })
                .then((list) => {
                    setInboxes(list);

                    if (list.length === 1) {
                        setSelectedInbox(list[0].name);
                    }
                })
                .finally(() => setLoadingInboxes(false));
        }
    }, [tab, order?.contact_id]);

    const handleSend = async () => {
        if (!selectedInbox || !messageText.trim() || !order?.billing?.phone) {
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
                    number: order.billing.phone,
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
        if (!selectedInbox || !order?.billing?.phone) {
return;
}

        const phone = order.billing.phone;
        const channelId = `${phone}@s.whatsapp.net`;
        router.visit(`/admin/entradas/${selectedInbox}?channel_id=${encodeURIComponent(channelId)}`);
    };

    return (
        <>
            <Head title="Orders — WooCommerce" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            ref={searchRef}
                            placeholder="Buscar por #, cliente o teléfono..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-64 pl-8 text-sm"
                        />
                    </div>
                    <select
                        className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s || 'Todos los estados'}</option>
                        ))}
                    </select>
                    <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Mostrar</span>
                        <select
                            className="rounded border border-input bg-background px-2 py-1 text-sm"
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setPage(1);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>registros</span>
                    </div>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Origen</TableHead>
                                <TableHead>Suscripción</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
<TableCell colSpan={8} className="text-center">Loading...</TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">No orders found.</TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="cursor-pointer transition-colors hover:bg-muted/50"
                                        onClick={() => handleRowClick(order.id)}
                                    >
                                        <TableCell className="font-medium">#{order.number}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {order.date_created ? new Date(order.date_created).toLocaleDateString() : '—'}
                                        </TableCell>
                                        <TableCell><StatusBadge status={order.status} /></TableCell>
                                        <TableCell>
                                            {order.is_pos ? (
                                                <Badge variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-400 whitespace-nowrap">
                                                    <Store className="size-3 mr-1" /> Punto de Venta
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Web</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {order.subscription_meta?.title ? (
                                                <Badge variant="secondary" className="whitespace-nowrap text-xs">
                                                    {order.subscription_meta.title}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {order.contact_name ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="size-6">
                                                        <AvatarImage src={order.contact_profile_pic_url ?? undefined} />
                                                        <AvatarFallback className="text-[10px]">
                                                            {order.contact_name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="truncate max-w-[120px]">{order.contact_name}</span>
                                                </div>
                                            ) : (
                                                customerName(order) || '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="tabular-nums">{order.currency} {order.total}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {order.billing?.phone || '—'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3">
                    <span className="text-sm text-muted-foreground">
                        {totalResults > 0
                            ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, totalResults)} de ${totalResults}`
                            : 'Sin resultados'}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(1)} className="px-2">&laquo;</Button>
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
                        <span className="px-2 text-sm">Página {page} de {totalPages || 1}</span>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-2">&raquo;</Button>
                    </div>
                </div>
            </div>

            <Sheet open={selectedId !== null} onOpenChange={(o) => {
 if (!o) {
 setSelectedId(null); setOrder(null); setPicSrc(undefined); setTab('detail'); setInboxes([]); setSelectedInbox(''); setMessageText('');
} 
}}>
                <SheetContent side="right" className="w-full max-w-md sm:max-w-lg overflow-y-auto p-0">
                    {loadingDetail && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-muted-foreground animate-pulse">Cargando detalles...</p>
                        </div>
                    )}

                    {!loadingDetail && order && (
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
                                                    {new Date(order.date_created).toLocaleDateString('es', {
                                                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </SheetDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {order.is_pos && (
                                                <Badge variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-400">
                                                    <Store className="size-3 mr-1" /> POS
                                                </Badge>
                                            )}
                                            <Badge className={'shrink-0 ' + (STATUS_COLORS[order.status] ?? '')}>
                                                {order.status}
                                            </Badge>
                                        </div>
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
                                    {order.shipping_total !== '0.00' && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Envío</p>
                                            <p className="text-sm font-medium">{order.currency} {order.shipping_total}</p>
                                        </div>
                                    )}
                                    {order.discount_total !== '0.00' && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Descuento</p>
                                            <p className="text-sm font-medium text-red-500">-{order.currency} {order.discount_total}</p>
                                        </div>
                                    )}
                                    {order.total_tax !== '0.00' && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Impuesto</p>
                                            <p className="text-sm font-medium">{order.currency} {order.total_tax}</p>
                                        </div>
                                    )}
                                </div>

                                {order.subscription_meta?.title && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CalendarDays className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suscripción</p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                                            <p className="text-sm font-bold">{order.subscription_meta.title}</p>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                                {order.subscription_meta.start_date && (
                                                    <div>
                                                        <span className="block">Inicio</span>
                                                        <span className="font-medium text-foreground">
                                                            {new Date(order.subscription_meta.start_date).toLocaleDateString('es')}
                                                        </span>
                                                    </div>
                                                )}
                                                {order.subscription_meta.end_date && (
                                                    <div>
                                                        <span className="block">Fin</span>
                                                        <span className="font-medium text-foreground">
                                                            {new Date(order.subscription_meta.end_date).toLocaleDateString('es')}
                                                        </span>
                                                    </div>
                                                )}
                                                {order.sale_date && (
                                                    <div>
                                                        <span className="block">Venta</span>
                                                        <span className="font-medium text-foreground">
                                                            {new Date(order.sale_date).toLocaleDateString('es')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {order.is_pos && order.tvp_terminal && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Store className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Punto de Venta</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="rounded-lg bg-muted/30 p-2">
                                                <span className="block text-muted-foreground">Terminal</span>
                                                <span className="font-medium">{order.tvp_terminal}</span>
                                            </div>
                                            <div className="rounded-lg bg-muted/30 p-2">
                                                <span className="block text-muted-foreground">Vendedor</span>
                                                <span className="font-medium">{order.tvp_vendedor || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {order.contact_id && order.contact_name && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <User className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contacto CRM</p>
                                        </div>
                                        <Link
                                            href={`/admin/contacts/${order.contact_id}/edit`}
                                            className="flex items-center gap-3 rounded-lg bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                                        >
                                            <Avatar className="size-10 shrink-0">
                                                <AvatarImage src={picSrc} />
                                                <AvatarFallback className={avatarColor(order.contact_name) + ' text-white text-sm font-bold'}>
                                                    {getInitials(order.contact_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-0.5 text-sm min-w-0">
                                                <p className="font-medium truncate">{order.contact_name}</p>
                                                <p className="text-muted-foreground truncate">{order.billing?.phone || order.billing?.email}</p>
                                            </div>
                                        </Link>
                                    </div>
                                )}

                                {customerName(order) && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <User className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Facturación</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Avatar className="size-12 shrink-0">
                                                <AvatarImage src={picSrc} alt={customerName(order)} />
                                                <AvatarFallback className={avatarColor(customerName(order)) + ' text-white text-base font-bold'}>
                                                    {getInitials(customerName(order))}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1 text-sm min-w-0">
                                                <p className="font-medium">{customerName(order)}</p>
                                            {order.billing?.email && (
                                                <p className="text-muted-foreground">{order.billing.email}</p>
                                            )}
                                            {order.billing?.phone && (
                                                <p className="text-muted-foreground">{order.billing.phone}</p>
                                            )}
                                            {(order.billing?.address_1 || order.billing?.city) && (
                                                <p className="text-muted-foreground flex items-start gap-1.5 mt-1">
                                                    <MapPin className="size-3.5 shrink-0 mt-0.5" />
                                                    <span>
                                                        {[order.billing.address_1, order.billing.address_2].filter(Boolean).join(', ')}
                                                        {order.billing.city && <><br />{order.billing.city}, {order.billing.state} {order.billing.postcode}</>}
                                                        {order.billing.country && <><br />{order.billing.country}</>}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(order.shipping?.first_name || order.shipping?.address_1) && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Package className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Envío</p>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            {order.shipping.first_name && (
                                                <p className="font-medium">
                                                    {order.shipping.first_name} {order.shipping.last_name}
                                                </p>
                                            )}
                                            {(order.shipping.address_1 || order.shipping.city) && (
                                                <p className="text-muted-foreground flex items-start gap-1.5">
                                                    <MapPin className="size-3.5 shrink-0 mt-0.5" />
                                                    <span>
                                                        {[order.shipping.address_1, order.shipping.address_2].filter(Boolean).join(', ')}
                                                        {order.shipping.city && <><br />{order.shipping.city}, {order.shipping.state} {order.shipping.postcode}</>}
                                                    </span>
                                                </p>
                                            )}
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
                                                        <p className="text-xs text-muted-foreground">× {item.quantity}{item.sku ? ` • ${item.sku}` : ''}</p>
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

                                {order.customer_note && (
                                    <div className="border-t pt-4">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Nota del cliente</p>
                                        <div className="bg-muted/30 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                                            {order.customer_note}
                                        </div>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="size-3.5 mr-1" /> Eliminar orden
                                    </Button>
                                </div>
                            </div>
                            )}

                            {tab === 'send' && (
                                <div className="px-6 py-4 space-y-4">
                                    {loadingInboxes ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : !order.contact_id ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            Esta orden no tiene un contacto vinculado en el CRM.
                                        </p>
                                    ) : !order.billing?.phone ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            Esta orden no tiene número de teléfono.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="rounded-lg bg-muted/30 p-3">
                                                <p className="text-xs text-muted-foreground">Contacto</p>
                                                <p className="text-sm font-medium mt-0.5">{order.contact_name ?? customerName(order) ?? '—'}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{order.billing?.phone ?? '—'}</p>
                                            </div>

                                            {inboxes.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-8">
                                                    No hay inboxes activos disponibles.
                                                </p>
                                            ) : (
                                                <>
                                                    <div>
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
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <ConfirmDialog {...dialogProps} />
        </>
    );
}
