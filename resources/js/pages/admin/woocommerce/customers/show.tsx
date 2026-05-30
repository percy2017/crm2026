import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import type { WooCustomer } from '@/types';

export default function WooCustomerShow({ customerId }: { customerId: number }) {
    const [customer, setCustomer] = useState<WooCustomer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/admin/woocommerce/customers/${customerId}`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : Promise.reject('Failed to load')))
            .then((json) => setCustomer(json.data))
            .catch((err) => setError(err instanceof Error ? err.message : String(err)))
            .finally(() => setLoading(false));
    }, [customerId]);

    if (loading) {
        return (
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Customer" description="Loading..." />
                <div className="text-center text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Customer" description="Error" />
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
                    {error ?? 'Customer not found'}
                </div>
                <Link href="/admin/woocommerce/customers">
                    <Button variant="outline">Back to Customers</Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <Head title={`${customer.first_name} ${customer.last_name} — WooCommerce`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {customer.avatar_url ? (
                            <img
                                src={customer.avatar_url}
                                alt={customer.first_name}
                                className="size-12 rounded-full border"
                            />
                        ) : (
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-lg text-muted-foreground">
                                {(customer.first_name?.[0] ?? '?').toUpperCase()}
                            </div>
                        )}
                        <div>
                            <Heading
                                title={`${customer.first_name} ${customer.last_name}`}
                                description={customer.email}
                            />
                        </div>
                    </div>
                    <Link href="/admin/woocommerce/customers">
                        <Button variant="outline" size="sm">Back</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border p-4">
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Account Details</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Username</span>
                                <span>{customer.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email</span>
                                <span>{customer.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Role</span>
                                <span className="capitalize">{customer.role}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Orders</span>
                                <span>{customer.orders_count}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Spent</span>
                                <span>{customer.total_spent}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Registered</span>
                                <span>
                                    {customer.date_created
                                        ? new Date(customer.date_created).toLocaleDateString()
                                        : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border p-4">
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Billing</h3>
                        {customer.billing ? (
                            <div className="space-y-1 text-sm">
                                <p className="font-medium">
                                    {customer.billing.first_name} {customer.billing.last_name}
                                </p>
                                {customer.billing.company && <p>{customer.billing.company}</p>}
                                <p>{customer.billing.address_1}{customer.billing.address_2 ? `, ${customer.billing.address_2}` : ''}</p>
                                <p>{customer.billing.city}, {customer.billing.state} {customer.billing.postcode}</p>
                                <p>{customer.billing.country}</p>
                                <p>{customer.billing.email}</p>
                                <p>{customer.billing.phone}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No billing info</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
