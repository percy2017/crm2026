import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { WooOrder } from '@/types';

const STATUS_COLORS: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'on-hold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    failed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function WooOrderShow({ orderId }: { orderId: number }) {
    const [order, setOrder] = useState<WooOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/admin/woocommerce/orders/${orderId}`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : Promise.reject('Failed to load')))
            .then((json) => setOrder(json.data))
            .catch((err) => setError(err instanceof Error ? err.message : String(err)))
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Order" description="Loading..." />
                <div className="text-center text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Order" description="Error" />
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
                    {error ?? 'Order not found'}
                </div>
                <Link href="/admin/woocommerce/orders">
                    <Button variant="outline">Back to Orders</Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <Head title={`Order #${order.number} — WooCommerce`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Heading
                            title={`Order #${order.number}`}
                            description={
                                order.date_created
                                    ? new Date(order.date_created).toLocaleString()
                                    : ''
                            }
                        />
                    </div>
                    <Link href="/admin/woocommerce/orders">
                        <Button variant="outline" size="sm">Back</Button>
                    </Link>
                </div>

                <div className="flex gap-2">
                    <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] ?? ''}`}
                    >
                        {order.status}
                    </span>
                    {order.payment_method_title && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                            {order.payment_method_title}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border p-4">
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Billing</h3>
                        {order.billing ? (
                            <div className="space-y-1 text-sm">
                                <p className="font-medium">
                                    {order.billing.first_name} {order.billing.last_name}
                                </p>
                                {order.billing.company && <p>{order.billing.company}</p>}
                                <p>{order.billing.address_1}{order.billing.address_2 ? `, ${order.billing.address_2}` : ''}</p>
                                <p>{order.billing.city}, {order.billing.state} {order.billing.postcode}</p>
                                <p>{order.billing.country}</p>
                                <p>{order.billing.email}</p>
                                <p>{order.billing.phone}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No billing info</p>
                        )}
                    </div>

                    <div className="rounded-xl border p-4">
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Shipping</h3>
                        {order.shipping ? (
                            <div className="space-y-1 text-sm">
                                <p className="font-medium">
                                    {order.shipping.first_name} {order.shipping.last_name}
                                </p>
                                {order.shipping.company && <p>{order.shipping.company}</p>}
                                <p>{order.shipping.address_1}{order.shipping.address_2 ? `, ${order.shipping.address_2}` : ''}</p>
                                <p>{order.shipping.city}, {order.shipping.state} {order.shipping.postcode}</p>
                                <p>{order.shipping.country}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No shipping info</p>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.line_items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="font-mono text-xs">{item.sku || '—'}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{order.currency} {item.price}</TableCell>
                                    <TableCell>{order.currency} {item.total}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end">
                    <div className="w-72 space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{order.currency} {order.subtotal}</span>
                        </div>
                        {order.shipping_total !== '0.00' && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{order.currency} {order.shipping_total}</span>
                            </div>
                        )}
                        {order.discount_total !== '0.00' && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="text-green-600">-{order.currency} {order.discount_total}</span>
                            </div>
                        )}
                        {order.total_tax !== '0.00' && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span>{order.currency} {order.total_tax}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t pt-1 font-medium">
                            <span>Total</span>
                            <span>{order.currency} {order.total}</span>
                        </div>
                    </div>
                </div>

                {order.coupon_lines.length > 0 && (
                    <div className="rounded-xl border p-4">
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Coupons</h3>
                        <div className="space-y-1 text-sm">
                            {order.coupon_lines.map((c) => (
                                <div key={c.id} className="flex justify-between">
                                    <span>{c.code}</span>
                                    <span className="text-green-600">-{order.currency} {c.discount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {order.customer_note && (
                    <div className="rounded-xl border p-4">
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Customer Note</h3>
                        <p className="text-sm">{order.customer_note}</p>
                    </div>
                )}
            </div>
        </>
    );
}
