import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RecentOrder = {
    id: number;
    number: string;
    status: string;
    total: string;
    date_created: string;
    line_items: { name: string; quantity: number }[];
};

type Props = {
    onRefetch: () => void;
};

export function RecentOrdersBar({ onRefetch }: Props) {
    const [orders, setOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);

        try {
            const res = await fetch('/admin/woocommerce/pos/recent-orders', {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (res.ok) {
                const json = await res.json();
                setOrders(json.data ?? []);
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status: string) => {
        const colors: Record<string, string> = {
            completed: 'bg-green-100 text-green-700',
            processing: 'bg-blue-100 text-blue-700',
            'on-hold': 'bg-yellow-100 text-yellow-700',
            pending: 'bg-gray-100 text-gray-700',
            cancelled: 'bg-red-100 text-red-700',
            refunded: 'bg-purple-100 text-purple-700',
        };

        return (
            <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', colors[status] || 'bg-gray-100 text-gray-700')}>
                {status}
            </span>
        );
    };

    if (loading && orders.length === 0) {
        return (
            <div className="rounded-lg border px-4 py-2 text-sm text-muted-foreground">
                Cargando órdenes...
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 overflow-x-auto rounded-lg border px-4 py-2">
            <span className="shrink-0 text-xs font-medium text-muted-foreground">Últimas órdenes:</span>
            {orders.length === 0 ? (
                <span className="text-sm text-muted-foreground">Sin órdenes aún</span>
            ) : (
                orders.map((order) => (
                    <div
                        key={order.id}
                        className="flex shrink-0 items-center gap-2 rounded-md bg-muted/30 px-3 py-1.5 text-sm"
                    >
                        <span className="font-medium">#{order.number}</span>
                        {statusBadge(order.status)}
                        <span className="tabular-nums text-muted-foreground">Bs {order.total}</span>
                    </div>
                ))
            )}
            <Button variant="ghost" size="sm" onClick={fetchOrders} className="shrink-0 ml-auto">
                Recargar
            </Button>
        </div>
    );
}
