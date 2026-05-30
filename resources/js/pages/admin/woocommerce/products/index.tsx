import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { WooPaginatedResponse, WooProduct } from '@/types';

export default function WooProductsIndex() {
    const [products, setProducts] = useState<WooProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const perPage = 20;

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const { confirm, dialogProps } = useConfirmDialog();

    const fetchProducts = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams({ per_page: String(perPage), page: String(page) });
        if (search) params.set('search', search);

        fetch(`/admin/woocommerce/products?${params}`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : Promise.reject('Failed to load')))
            .then((json: WooPaginatedResponse<WooProduct>) => {
                setProducts(json.data);
                setTotalResults(json.meta.total_results);
                setTotalPages(json.meta.total_pages);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page, search]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            const res = await fetch(`/admin/woocommerce/products/${id}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (!res.ok) throw new Error('Failed to delete');

            router.reload({ only: [] });
        } catch {
            setDeletingId(null);
        }
    };

    return (
        <>
            <Head title="Products — WooCommerce" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Products" description="WooCommerce products" />
                    <div className="flex items-center gap-2">
                        <Link href="/admin/woocommerce/products/create">
                            <Button size="sm">+ Add Product</Button>
                        </Link>
                        <Link href="/admin/woocommerce">
                            <Button variant="outline" size="sm">Dashboard</Button>
                        </Link>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Show</span>
                        <span className="text-sm font-medium">{perPage}</span>
                        <span className="text-sm text-muted-foreground">per page</span>
                    </div>
                    <Input
                        placeholder="Search products..."
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
                                <TableHead>SKU</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No products found.</TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-mono text-xs">{product.sku || '—'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {product.images[0] && (
                                                    <img
                                                        src={product.images[0].src}
                                                        alt={product.name}
                                                        className="size-10 rounded border object-cover"
                                                    />
                                                )}
                                                <span className="font-medium">{product.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {product.sale_price ? (
                                                <span>
                                                    <span className="text-red-600">{product.sale_price}</span>
                                                    {' '}
                                                    <span className="text-xs text-muted-foreground line-through">
                                                        {product.regular_price}
                                                    </span>
                                                </span>
                                            ) : (
                                                product.price
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    product.stock_status === 'instock'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                            >
                                                {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{product.type}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Link href={`/admin/woocommerce/products/${product.id}`}>
                                                    <Button variant="outline" size="sm">View</Button>
                                                </Link>
                                                <Link href={`/admin/woocommerce/products/${product.id}/edit`}>
                                                    <Button variant="outline" size="sm">Edit</Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                                    disabled={deletingId === product.id}
                                                    onClick={() =>
                                                        confirm(
                                                            () => handleDelete(product.id),
                                                            'Delete Product',
                                                            `Are you sure you want to delete "${product.name}"?`,
                                                        )
                                                    }
                                                >
                                                    {deletingId === product.id ? '...' : 'Delete'}
                                                </Button>
                                            </div>
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
                        <span className="px-2 text-sm">
                            Page {page} of {totalPages || 1}
                        </span>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-2">&raquo;</Button>
                    </div>
                </div>

                <ConfirmDialog {...dialogProps} />
            </div>
        </>
    );
}
