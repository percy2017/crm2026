import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { WooCustomer, WooPaginatedResponse } from '@/types';

export default function WooCustomersIndex() {
    const [customers, setCustomers] = useState<WooCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const perPage = 20;

    const fetchCustomers = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams({ per_page: String(perPage), page: String(page) });
        if (search) params.set('search', search);

        fetch(`/admin/woocommerce/customers?${params}`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : Promise.reject('Failed to load')))
            .then((json: WooPaginatedResponse<WooCustomer>) => {
                setCustomers(json.data);
                setTotalResults(json.meta.total_results);
                setTotalPages(json.meta.total_pages);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page, search]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    return (
        <>
            <Head title="Customers — WooCommerce" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Customers" description="WooCommerce customers" />
                    <Link href="/admin/woocommerce">
                        <Button variant="outline" size="sm">Dashboard</Button>
                    </Link>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Show</span>
                        <span className="text-sm font-medium">{perPage}</span>
                        <span className="text-sm text-muted-foreground">per page</span>
                    </div>
                    <Input
                        placeholder="Search customers..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="max-w-sm"
                    />
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Orders</TableHead>
                                <TableHead>Total Spent</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : customers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">No customers found.</TableCell>
                                </TableRow>
                            ) : (
                                customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {customer.avatar_url ? (
                                                    <img
                                                        src={customer.avatar_url}
                                                        alt={customer.first_name}
                                                        className="size-8 rounded-full border"
                                                    />
                                                ) : (
                                                    <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                                                        {(customer.first_name?.[0] ?? '?').toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-medium">
                                                    {customer.first_name
                                                        ? `${customer.first_name} ${customer.last_name}`
                                                        : customer.username || customer.email
                                                    }
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{customer.email}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{customer.username}</TableCell>
                                        <TableCell>{customer.orders_count}</TableCell>
                                        <TableCell>{customer.total_spent}</TableCell>
                                        <TableCell className="text-sm">
                                            {customer.billing?.country || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(`/admin/woocommerce/customers/${customer.id}`, '_blank')}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
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
        </>
    );
}
