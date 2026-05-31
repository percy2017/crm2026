import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import {
    ShoppingBag,
    User,
    CreditCard,
    CalendarDays,
    MapPin,
    TicketPercent,
    Package,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { ConfirmDialog } from '@/components/confirm-dialog';
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
    const perPage = 20;

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [order, setOrder] = useState<WooOrder | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [picSrc, setPicSrc] = useState<string | undefined>();
    const { confirm, dialogProps } = useConfirmDialog();

    const fetchOrders = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams({ per_page: String(perPage), page: String(page) });
        if (status) params.set('status', status);

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
    }, [page, status]);

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
        if (!order) return;
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
                    if (!res.ok) throw new Error((await res.json()).error ?? 'Error al eliminar');
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

    return (
        <>
            <Head title="Orders — WooCommerce" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Filter by status:</span>
                    <select
                        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s || 'All Statuses'}</option>
                        ))}
                    </select>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Customer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No orders found.</TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="cursor-pointer transition-colors hover:bg-muted/50"
                                        onClick={() => handleRowClick(order.id)}
                                    >
                                        <TableCell className="font-medium">#{order.number}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {order.date_created ? new Date(order.date_created).toLocaleDateString() : '—'}
                                        </TableCell>
                                        <TableCell><StatusBadge status={order.status} /></TableCell>
                                        <TableCell>{order.currency} {order.total}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {order.payment_method_title || '—'}
                                        </TableCell>
                                        <TableCell className="text-sm">{customerName(order) || '—'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {totalResults > 0
                            ? `Showing ${(page - 1) * perPage + 1} to ${Math.min(page * perPage, totalResults)} of ${totalResults}`
                            : 'No entries'}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(1)} className="px-2">&laquo;</Button>
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                        <span className="px-2 text-sm">Page {page} of {totalPages || 1}</span>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-2">&raquo;</Button>
                    </div>
                </div>
            </div>

            <Sheet open={selectedId !== null} onOpenChange={(o) => { if (!o) { setSelectedId(null); setOrder(null); setPicSrc(undefined); } }}>
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
                                        <Badge className={'shrink-0 ' + (STATUS_COLORS[order.status] ?? '')}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </SheetHeader>
                            </div>

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
                                            </div>
                                        </div>
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
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <ConfirmDialog {...dialogProps} />
        </>
    );
}
