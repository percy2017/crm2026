import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import {
    Package,
    Tag,
    Layers,
    BarChart3,
    ShoppingCart,
    DollarSign,
    Trash2,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
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

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [productDetail, setProductDetail] = useState<WooProduct | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

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

    useEffect(() => {
        if (selectedId === null) return;
        setLoadingDetail(true);
        setProductDetail(null);
        fetch(`/admin/woocommerce/products/${selectedId}`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : Promise.reject('Failed to load')))
            .then((json) => setProductDetail(json.data))
            .catch(() => {})
            .finally(() => setLoadingDetail(false));
    }, [selectedId]);

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            const res = await fetch(`/admin/woocommerce/products/${id}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (!res.ok) throw new Error('Failed to delete');

            if (selectedId === id) {
                setSelectedId(null);
                setProductDetail(null);
            }
            fetchProducts();
        } catch {
            setDeletingId(null);
        }
    };

    const stockColor = (status: string) =>
        status === 'instock'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

    const formatPrice = (p: WooProduct) => {
        if (p.type === 'variable') return `${p.price} — ${p.regular_price}`;
        if (p.sale_price) {
            return (
                <span>
                    <span className="text-red-600">{p.sale_price}</span>
                    {' '}
                    <span className="text-xs text-muted-foreground line-through">{p.regular_price}</span>
                </span>
            );
        }
        return p.price;
    };

    return (
        <>
            <Head title="Products — WooCommerce" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
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
                                    <TableRow
                                        key={product.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => setSelectedId(product.id)}
                                    >
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
                                        <TableCell>{formatPrice(product)}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stockColor(product.stock_status)}`}
                                            >
                                                {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{product.type}</TableCell>
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

            <Sheet open={selectedId !== null} onOpenChange={(o) => { if (!o) { setSelectedId(null); setProductDetail(null); } }}>
                <SheetContent side="right" className="w-full max-w-md sm:max-w-lg overflow-y-auto p-0">
                    {loadingDetail && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-muted-foreground animate-pulse">Cargando producto...</p>
                        </div>
                    )}

                    {!loadingDetail && productDetail && (
                        <>
                            <div className="sticky top-0 z-10 border-b bg-card px-6 py-4">
                                <SheetHeader className="text-left">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {productDetail.images[0] && (
                                                <Avatar className="size-12 rounded-lg">
                                                    <AvatarImage src={productDetail.images[0].src} alt={productDetail.name} />
                                                    <AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-sm font-bold">
                                                        {productDetail.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className="min-w-0">
                                                <SheetTitle className="text-lg truncate">{productDetail.name}</SheetTitle>
                                                <SheetDescription>
                                                    {productDetail.sku && <>{productDetail.sku} · </>}
                                                    {productDetail.type}
                                                </SheetDescription>
                                            </div>
                                        </div>
                                        <Badge className={'shrink-0 ' + stockColor(productDetail.stock_status)}>
                                            {productDetail.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
                                        </Badge>
                                    </div>
                                </SheetHeader>
                            </div>

                            <div className="px-6 py-4 space-y-6">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="text-xs text-muted-foreground">Precio regular</p>
                                        <p className="text-lg font-bold">${productDetail.regular_price || productDetail.price}</p>
                                    </div>
                                    {productDetail.sale_price && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Precio oferta</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <DollarSign className="size-3.5 text-red-500" />
                                                <p className="text-sm font-medium text-red-500">{productDetail.sale_price}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="text-xs text-muted-foreground">Tipo</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Package className="size-3.5 text-muted-foreground" />
                                            <p className="text-sm font-medium capitalize">{productDetail.type}</p>
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="text-xs text-muted-foreground">Stock</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <ShoppingCart className="size-3.5 text-muted-foreground" />
                                            <p className="text-sm font-medium">
                                                {productDetail.stock_quantity ?? (productDetail.stock_status === 'instock' ? 'Disponible' : 'Agotado')}
                                            </p>
                                        </div>
                                    </div>
                                    {productDetail.average_rating && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Rating</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <BarChart3 className="size-3.5 text-muted-foreground" />
                                                <p className="text-sm font-medium">{productDetail.average_rating} ({productDetail.rating_count})</p>
                                            </div>
                                        </div>
                                    )}
                                    {productDetail.total_sales > 0 && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Vendidos</p>
                                            <p className="text-sm font-medium">{productDetail.total_sales}</p>
                                        </div>
                                    )}
                                </div>

                                {productDetail.description && (
                                    <div className="border-t pt-4">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Descripción</p>
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground"
                                            dangerouslySetInnerHTML={{ __html: productDetail.description }}
                                        />
                                    </div>
                                )}

                                {productDetail.categories && productDetail.categories.length > 0 && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Layers className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categorías</p>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {productDetail.categories.map((c) => (
                                                <Badge key={c.id} variant="secondary">{c.name}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {productDetail.brands && productDetail.brands.length > 0 && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Tag className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Marcas</p>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {productDetail.brands.map((b) => (
                                                <Badge key={b.id} variant="outline">{b.name}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {productDetail.tags && productDetail.tags.length > 0 && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Tag className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</p>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {productDetail.tags.map((t) => (
                                                <Badge key={t.id} variant="secondary">{t.name}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {productDetail.attributes && productDetail.attributes.length > 0 && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Layers className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Atributos</p>
                                        </div>
                                        <div className="space-y-2">
                                            {productDetail.attributes.map((attr) => (
                                                <div key={attr.id} className="bg-muted/20 rounded-lg px-3 py-2">
                                                    <p className="text-xs font-semibold text-muted-foreground">{attr.name}</p>
                                                    <p className="text-sm">{attr.options.join(', ')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {productDetail.variations && productDetail.variations.length > 0 && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <ShoppingCart className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Variaciones ({productDetail.variations.length})
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {productDetail.variations.map((vId) => (
                                                <Badge key={vId} variant="outline">#{vId}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {productDetail.permalink && (
                                    <div className="border-t pt-4">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Enlace</p>
                                        <a
                                            href={productDetail.permalink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline break-all"
                                        >
                                            {productDetail.permalink}
                                        </a>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full"
                                        onClick={() =>
                                            confirm(
                                                () => handleDelete(productDetail.id),
                                                'Eliminar producto',
                                                `¿Estás seguro de eliminar "${productDetail.name}"?`,
                                            )
                                        }
                                    >
                                        <Trash2 className="size-3.5 mr-1" /> Eliminar
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <ConfirmDialog {...dialogProps} />
        </>
    );
}
