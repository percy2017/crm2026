import { Link, usePage } from '@inertiajs/react';
import Echo from 'laravel-echo';
import { Archive, BookUser, Globe, Images, Inbox as InboxIcon, LayoutGrid, MessageSquare, Settings, ShieldCheck, ShoppingCart, Timer, TrendingUp, Zap, ZapIcon } from 'lucide-react';
import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { index as adminUsersIndex } from '@/routes/admin/users';
import type { NavItem } from '@/types';

type SharedInbox = {
    id: number;
    name: string;
    type: string;
    webhook_enabled: boolean;
    config: { connectionStatus?: string } | null;
};

const STATUS_COLORS: Record<string, string> = {
    open: 'bg-green-500',
    closed: 'bg-red-500',
    connecting: 'bg-yellow-500',
    syncing: 'bg-yellow-500',
    disconnected: 'bg-gray-400',
    removed: 'bg-red-500',
    stale: 'bg-orange-400',
};

const STATUS_LABELS: Record<string, string> = {
    stale: '⚠️ Sin actividad reciente',
    disconnected: '🔌 Desconectado',
    removed: '❌ Eliminado',
    connecting: '🔄 Conectando...',
};

function StatusDot({ status }: { status?: string }) {
    return (
        <span className={`size-2 shrink-0 rounded-full ${status ? (STATUS_COLORS[status] ?? 'bg-gray-300') : 'bg-gray-300'}`} />
    );
}

export function AppSidebar() {
    const { inboxes: initialInboxes } = usePage().props as unknown as {
        inboxes: SharedInbox[];
    };

    const [inboxes, setInboxes] = useState(initialInboxes);

    useEffect(() => {
        setInboxes(initialInboxes);
    }, [initialInboxes]);

    useEffect(() => {
        const pusherClient = new Pusher(import.meta.env.VITE_REVERB_APP_KEY, {
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
            wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
            wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 6001),
            wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 6001),
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
            channelAuthorization: {
                endpoint: '/broadcasting/auth',
                transport: 'ajax',
            },
        });

        const echo = new Echo({
            broadcaster: 'reverb',
            client: pusherClient,
            authEndpoint: '/broadcasting/auth',
        } as any);

        const channel = echo.private('inboxes.global');

        channel.listen('.inbox.status.updated', (data: {
            instance: string;
            connection_status: string;
            inbox_status: string;
        }) => {
            setInboxes((prev) =>
                prev.map((inbox) =>
                    inbox.name === data.instance
                        ? {
                            ...inbox,
                            config: { ...inbox.config, connectionStatus: data.connection_status },
                        }
                        : inbox,
                ),
            );

            const label = STATUS_LABELS[data.connection_status];

            if (label) {
                toast(label, {
                    description: `Inbox: ${data.instance}`,
                });
            }

            if (data.connection_status === 'open') {
                toast('✅ Inbox conectado', {
                    description: `Inbox: ${data.instance}`,
                });
            }
        });

        return () => {
            channel.stopListening('.inbox.status.updated');
            echo.leave('inboxes.global');
        };
    }, []);

    const activeInboxes = (inboxes ?? []).filter(
        (inst) => inst.type === 'evolution',
    );
    const webInboxes = (inboxes ?? []).filter(
        (inst) => inst.type === 'web',
    );

    const platformItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/admin',
            icon: LayoutGrid,
        },
        {
            title: 'Deals',
            href: '/admin/deals',
            icon: TrendingUp,
        },
    ];

    const messagingItems: NavItem[] = [
        {
            title: 'Entradas',
            href: '#',
            icon: MessageSquare,
            children: [
                ...activeInboxes.map((inst) => ({
                    title: (
                        <span className="flex items-center gap-2">
                            <StatusDot status={inst.config?.connectionStatus} />
                            {inst.name}
                        </span>
                    ),
                    href: `/admin/entradas/${inst.name}`,
                    icon: Zap,
                })),
                ...webInboxes.map((w) => ({
                    title: w.name,
                    href: `/admin/entradas/${w.name}`,
                    icon: Globe,
                })),
            ],
        },
        {
            title: 'Contacts',
            href: '/admin/contacts',
            icon: BookUser,
            children: [
                { title: 'All Contacts', href: '/admin/contacts' },
                { title: 'Create Contact', href: '/admin/contacts/create' },
                { title: 'Import Contacts', href: '/admin/contacts/import' },
            ],
        },
        {
            title: 'Inboxes',
            href: '#',
            icon: InboxIcon,
            children: [
                { title: 'All Inboxes', href: '/admin/inboxes' },
                { title: 'Create Inbox', href: '/admin/inboxes/create' },
                { title: 'Backups', href: '/admin/inboxes/backups', icon: Archive },
            ],
        },
        {
            title: 'Medios',
            href: '/admin/media',
            icon: Images,
        },
        {
            title: 'Resp. Rápidas',
            href: '/admin/quick-replies',
            icon: ZapIcon,
        },
        {
            title: 'Cron Jobs',
            href: '/admin/cron-jobs',
            icon: Timer,
        },
    ];

    const commerceItems: NavItem[] = [
        {
            title: 'WooCommerce',
            href: '/admin/woocommerce',
            icon: ShoppingCart,
            children: [
                { title: 'POS', href: '/admin/woocommerce/pos' },
                { title: 'Orders', href: '/admin/woocommerce/orders' },
                { title: 'Calendario', href: '/admin/woocommerce/subscriptions/calendar' },
            ],
        },
    ];

    const systemItems: NavItem[] = [
        {
            title: 'Configuración',
            href: '#',
            icon: Settings,
            children: [
                { title: 'Users', href: adminUsersIndex() },
                { title: 'Roles', href: '/admin/roles', icon: ShieldCheck },
                { title: 'Reverb Monitor', href: '/reverb-monitor' },
            ],
        },
    ];

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={platformItems} label="Platform" />
                <NavMain items={messagingItems} label="Messaging" />
                <NavMain items={commerceItems} label="Commerce" />
                <NavMain items={systemItems} label="System" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}