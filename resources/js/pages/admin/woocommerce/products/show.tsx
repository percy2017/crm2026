import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { WooProduct } from '@/types';

export default function WooProductShow({ productId }: { productId: number }) {
    const [product, setProduct] = useState<WooProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/admin/woocommerce/products/${productId}`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : Promise.reject('Failed to load')))
            .then((json) => setProduct(json.data))
            .catch((err) => setError(err instanceof Error ? err.message : String(err)))
            .finally(() => setLoading(false));
    }, [productId]);

    if (loading) {
        return (
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Product" description="Loading..." />
                <div className="text-center text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Heading title="Product" description="Error" />
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
                    {error ?? 'Product not found'}
                </div>
                <Link href="/admin/woocommerce/products">
                    <Button variant="outline">Back to Products</Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <Head title={`${product.name} — WooCommerce`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Heading title={product.name} description={`SKU: ${product.sku || '—'}`} />
                    </div>
                    <Link href="/admin/woocommerce/products">
                        <Button variant="outline" size="sm">Back</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-xl border p-4">
                            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Description</h3>
                            <div
                                className="prose prose-sm max-w-none dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: product.description || 'No description' }}
                            />
                        </div>

                        {product.attributes.length > 0 && (
                            <div className="rounded-xl border p-4">
                                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Attributes</h3>
                                <div className="space-y-1">
                                    {product.attributes.map((attr) => (
                                        <div key={attr.id} className="flex gap-2 text-sm">
                                            <span className="font-medium">{attr.name}:</span>
                                            <span className="text-muted-foreground">{attr.options.join(', ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border p-4">
                            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Pricing</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Regular</span>
                                    <span>{product.regular_price}</span>
                                </div>
                                {product.sale_price && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Sale</span>
                                        <span>{product.sale_price}</span>
                                    </div>
                                )}
                                {product.on_sale && (
                                    <Badge variant="outline" className="mt-1">On Sale</Badge>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border p-4">
                            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Stock</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Status</span>
                                    <span>{product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}</span>
                                </div>
                                {product.manage_stock && (
                                    <div className="flex justify-between">
                                        <span>Quantity</span>
                                        <span>{product.stock_quantity ?? '—'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border p-4">
                            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Details</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Type</span>
                                    <span className="capitalize">{product.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status</span>
                                    <span className="capitalize">{product.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sales</span>
                                    <span>{product.total_sales}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Rating</span>
                                    <span>{product.average_rating} ({product.rating_count})</span>
                                </div>
                                {product.categories.length > 0 && (
                                    <div className="flex justify-between">
                                        <span>Categories</span>
                                        <span>{product.categories.map((c) => c.name).join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {product.images.length > 0 && (
                            <div className="rounded-xl border p-4">
                                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Images</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {product.images.map((img) => (
                                        <img
                                            key={img.id}
                                            src={img.src}
                                            alt={img.alt || product.name}
                                            className="rounded border object-cover"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
