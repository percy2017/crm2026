import { Head, Link } from '@inertiajs/react';
import { MessageSquare, Inbox, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type DashboardData = {
    messages_today: number;
    messages_sent_today: number;
    messages_received_today: number;
    active_conversations: number;
    total_contacts: number;
    new_contacts_today: number;
    active_inboxes: number;
    recent_conversations: Array<{
        id: number;
        contact_name: string;
        contact_phone: string | null;
        last_message_at: string | null;
    }>;
    inboxes: Array<{
        name: string;
        type: string;
        connection_status: string;
    }>;
    woo_orders_today: number;
    woo_sales_today: string;
    woo_recent_orders: Array<{
        id: number;
        number: string;
        total: string;
        status: string;
        date_created: string;
    }>;
};

const STATUS_COLORS: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'on-hold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);

    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);

    return `hace ${days}d`;
}

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof MessageSquare; label: string; value: number | string; sub?: string }) {
    return (
        <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/admin/dashboard-data', {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then((res) => (res.ok ? res.json() : Promise.reject('Failed')))
            .then(setData)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">Dashboard</h1>

                {loading ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                            <StatCard
                                icon={MessageSquare}
                                label="Mensajes hoy"
                                value={data?.messages_today ?? 0}
                                sub={`${data?.messages_sent_today ?? 0} env · ${data?.messages_received_today ?? 0} rec`}
                            />
                            <StatCard
                                icon={Inbox}
                                label="Conversaciones"
                                value={data?.active_conversations ?? 0}
                                sub="activas"
                            />
                            <StatCard
                                icon={Users}
                                label="Contactos"
                                value={data?.total_contacts ?? 0}
                                sub={data?.new_contacts_today ? `+${data.new_contacts_today} hoy` : undefined}
                            />
                            <StatCard
                                icon={ShoppingCart}
                                label="Ventas hoy"
                                value={`Bs. ${data?.woo_sales_today ?? '0.00'}`}
                                sub={`${data?.woo_orders_today ?? 0} pedidos`}
                            />
                            <StatCard
                                icon={DollarSign}
                                label="Pedidos hoy"
                                value={data?.woo_orders_today ?? 0}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <div className="rounded-xl border bg-card p-4">
                                <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Últimas conversaciones</h2>
                                {data?.recent_conversations && data.recent_conversations.length > 0 ? (
                                    <div className="space-y-2">
                                        {data.recent_conversations.map((conv) => (
                                            <div key={conv.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
                                                <Avatar className="size-8">
                                                    <AvatarFallback className="text-xs">
                                                        {(conv.contact_name ?? '?')[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{conv.contact_name}</p>
                                                    {conv.contact_phone && (
                                                        <p className="truncate text-xs text-muted-foreground">{conv.contact_phone}</p>
                                                    )}
                                                </div>
                                                {conv.last_message_at && (
                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                        {timeAgo(conv.last_message_at)}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Sin conversaciones</p>
                                )}
                            </div>

                            <div className="rounded-xl border bg-card p-4">
                                <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Estado de inboxes</h2>
                                {data?.inboxes && data.inboxes.length > 0 ? (
                                    <div className="space-y-2">
                                        {data.inboxes.map((inbox) => (
                                            <div key={inbox.name} className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-2 rounded-full ${inbox.connection_status === 'open' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                    <div>
                                                        <p className="text-sm font-medium">{inbox.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {inbox.type === 'evolution' ? 'WhatsApp' : 'Web'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-medium ${inbox.connection_status === 'open' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {inbox.connection_status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Sin inboxes configurados</p>
                                )}
                            </div>

                            <div className="rounded-xl border bg-card p-4">
                                <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Últimas ventas</h2>
                                {data?.woo_recent_orders && data.woo_recent_orders.length > 0 ? (
                                    <div className="space-y-2">
                                        {data.woo_recent_orders.map((order) => (
                                            <Link
                                                key={order.id}
                                                href={`/admin/woocommerce/orders/${order.id}`}
                                                className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">#{order.number}</span>
                                                    <Badge className={`text-[10px] ${STATUS_COLORS[order.status] ?? ''}`}>
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                                <span className="text-sm">Bs. {order.total}</span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Sin ventas</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
