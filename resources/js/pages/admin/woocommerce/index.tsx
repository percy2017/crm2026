import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index as adminWooCommerceIndex } from '@/routes/admin/woocommerce';
import type { WooDashboard, WooOrder } from '@/types';

const STATUS_COLORS: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'on-hold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    failed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'}`}
        >
            {status}
        </span>
    );
}

export default function WooCommerceDashboard() {
    const [data, setData] = useState<WooDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${adminWooCommerceIndex().url}/dashboard-data`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : Promise.reject('Failed to load')))
            .then((json) => setData(json))
            .catch((err) => setError(err instanceof Error ? err.message : String(err)))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <Head title="WooCommerce Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <Heading title="WooCommerce" description="Loading dashboard..." />
                    <div className="text-center text-muted-foreground">Loading...</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Head title="WooCommerce Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <Heading title="WooCommerce" description="Dashboard" />
                    <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                        Error: {error}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="WooCommerce Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border p-4">
                        <div className="text-sm text-muted-foreground">Total Sales</div>
                        <div className="mt-1 text-2xl font-bold">{data?.total_sales ? `${data.total_sales}` : '—'}</div>
                    </div>
                    <div className="rounded-xl border p-4">
                        <div className="text-sm text-muted-foreground">Orders</div>
                        <div className="mt-1 text-2xl font-bold">{data?.total_orders ?? '—'}</div>
                    </div>
                    <div className="rounded-xl border p-4">
                        <div className="text-sm text-muted-foreground">Products</div>
                        <div className="mt-1 text-2xl font-bold">{data?.total_products ?? '—'}</div>
                    </div>
                    <div className="rounded-xl border p-4">
                        <div className="text-sm text-muted-foreground">Customers</div>
                        <div className="mt-1 text-2xl font-bold">{data?.total_customers ?? '—'}</div>
                        <Link href="/admin/woocommerce/customers" className="text-xs text-blue-600 hover:underline">
                            View all
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border p-4">
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Top Selling Products</h3>
                        {data?.top_sellers && data.top_sellers.length > 0 ? (
                            <div className="space-y-2">
                                {data.top_sellers.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                        <span className="truncate">{item.name}</span>
                                        <span className="ml-2 shrink-0 text-muted-foreground">
                                            {item.quantity} sold
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">No data available</div>
                        )}
                    </div>

                    <div className="rounded-xl border p-4">
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Recent Orders</h3>
                        {data?.recent_orders && data.recent_orders.length > 0 ? (
                            <div className="space-y-2">
                                {data.recent_orders.map((order: WooOrder) => (
                                    <Link
                                        key={order.id}
                                        href={`/admin/woocommerce/orders/${order.id}`}
                                        className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">#{order.number}</span>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <span>{order.currency} {order.total}</span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">No orders yet</div>
                        )}
                        <Link
                            href="/admin/woocommerce/orders"
                            className="mt-2 block text-xs text-blue-600 hover:underline"
                        >
                            View all orders
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
