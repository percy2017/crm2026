import { Link } from '@inertiajs/react';
import { BookUser, Images, LayoutGrid, Radio, Smartphone, ShoppingCart, Users } from 'lucide-react';
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
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: adminUsersIndex(),
        icon: Users,
    },
    {
        title: 'Reverb Monitor',
        href: '/reverb-monitor',
        icon: Radio,
    },
    {
        title: 'Evolution Instances',
        href: '/admin/evolution-instances',
        icon: Smartphone,
    },
    {
        title: 'Contacts',
        href: '/admin/contacts',
        icon: BookUser,
    },
    {
        title: 'Medios',
        href: '/admin/media',
        icon: Images,
    },
    {
        title: 'WooCommerce',
        href: '/admin/woocommerce',
        icon: ShoppingCart,
        children: [
            { title: 'POS', href: '/admin/woocommerce/pos' },
            { title: 'Dashboard', href: '/admin/woocommerce' },
            { title: 'Products', href: '/admin/woocommerce/products' },
            { title: 'Orders', href: '/admin/woocommerce/orders' },
            { title: 'Customers', href: '/admin/woocommerce/customers' },
        ],
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
