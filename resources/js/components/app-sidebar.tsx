import { Link, usePage } from '@inertiajs/react';
import { BookUser, Globe, Images, LayoutGrid, MessageSquare, Settings, ShieldCheck, ShoppingCart, TrendingUp } from 'lucide-react';
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
import { dashboard } from '@/routes';
import { index as adminUsersIndex } from '@/routes/admin/users';
import type { EvolutionInstance, NavItem } from '@/types';

export function AppSidebar() {
    const { evolutionInstances } = usePage().props as unknown as {
        evolutionInstances: EvolutionInstance[];
    };

    const platformItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
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
                ...(evolutionInstances ?? []).map((inst) => ({
                    title: inst.name,
                    href: `/admin/entradas/${inst.name}`,
                })),
                { title: 'Web Chat', href: '/admin/web-chat', icon: Globe },
            ],
        },
        {
            title: 'Contacts',
            href: '/admin/contacts',
            icon: BookUser,
            children: [
                { title: 'All Contacts', href: '/admin/contacts' },
                { title: 'Create Contact', href: '/admin/contacts/create' },
            ],
        },
        {
            title: 'Medios',
            href: '/admin/media',
            icon: Images,
        },
    ];

    const commerceItems: NavItem[] = [
        {
            title: 'WooCommerce',
            href: '/admin/woocommerce',
            icon: ShoppingCart,
            children: [
                { title: 'POS', href: '/admin/woocommerce/pos' },
                { title: 'Products', href: '/admin/woocommerce/products' },
                { title: 'Orders', href: '/admin/woocommerce/orders' },
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
                { title: 'Evolution API', href: '/admin/evolution-instances' },
                { title: 'Web Widgets', href: '/admin/web-widgets' },
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
                            <Link href={dashboard()} prefetch>
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
