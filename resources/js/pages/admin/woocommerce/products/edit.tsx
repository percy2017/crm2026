import { Head, Link, router } from '@inertiajs/react';
import { useState  } from 'react';
import type { FormEvent } from 'react';
import type {ChangeEvent} from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import type { WooProduct } from '@/types';

type Category = { id: number; name: string; slug: string };
type Tag = { id: number; name: string; slug: string };

export default function WooProductEdit({
    product,
    categories,
    tags,
}: {
    product: WooProduct;
    categories: Category[];
    tags: Tag[];
}) {
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [values, setValues] = useState({
        name: product.name,
        type: product.type,
        status: product.status,
        regular_price: product.regular_price,
        sale_price: product.sale_price ?? '',
        sku: product.sku ?? '',
        manage_stock: product.manage_stock,
        stock_quantity: product.stock_quantity ?? 0,
        stock_status: product.stock_status,
        description: product.description ?? '',
        short_description: product.short_description ?? '',
    });

    const [selectedCategories, setSelectedCategories] = useState<number[]>(
        product.categories.map((c) => c.id),
    );
    const [selectedTags, setSelectedTags] = useState<number[]>(
        product.tags.map((t) => t.id),
    );
    const [images, setImages] = useState<{ src: string }[]>(
        product.images.map((img) => ({ src: img.src })),
    );

    const toggleCategory = (id: number) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
        );
    };

    const toggleTag = (id: number) => {
        setSelectedTags((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
        );
    };

    const addImage = () => setImages((prev) => [...prev, { src: '' }]);
    const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const payload = {
            ...values,
            categories: selectedCategories.map((id) => ({ id })),
            tags: selectedTags.map((id) => ({ id })),
            images: images.filter((img) => img.src),
        };

        try {
            const res = await fetch(`/admin/woocommerce/products/${product.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                setErrors(data.errors ?? { error: data.error ?? 'Failed to update product' });

                return;
            }

            router.visit('/admin/woocommerce/products');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title={`Edit ${product.name} — WooCommerce`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title={`Edit: ${product.name}`} description={`SKU: ${product.sku || '—'}`} />
                    <Link href="/admin/woocommerce/products">
                        <Button variant="outline" size="sm">Back</Button>
                    </Link>
                </div>

                {errors.error && (
                    <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                        {errors.error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="rounded-xl border p-4 space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Basic Info</h3>

                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={values.name}
                                onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
                                required
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={values.type}
                                    onValueChange={(v) => setValues((p) => ({ ...p, type: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="simple">Simple</SelectItem>
                                        <SelectItem value="variable">Variable</SelectItem>
                                        <SelectItem value="grouped">Grouped</SelectItem>
                                        <SelectItem value="external">External</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={values.status}
                                    onValueChange={(v) => setValues((p) => ({ ...p, status: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="publish">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border p-4 space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Pricing</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="regular_price">Regular Price *</Label>
                                <Input
                                    id="regular_price"
                                    value={values.regular_price}
                                    onChange={(e) => setValues((p) => ({ ...p, regular_price: e.target.value }))}
                                    placeholder="0.00"
                                    required
                                />
                                {errors.regular_price && <p className="text-xs text-red-500">{errors.regular_price}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sale_price">Sale Price</Label>
                                <Input
                                    id="sale_price"
                                    value={values.sale_price}
                                    onChange={(e) => setValues((p) => ({ ...p, sale_price: e.target.value }))}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border p-4 space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Inventory</h3>

                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                value={values.sku}
                                onChange={(e) => setValues((p) => ({ ...p, sku: e.target.value }))}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="manage_stock"
                                checked={values.manage_stock}
                                onCheckedChange={(checked) =>
                                    setValues((p) => ({ ...p, manage_stock: !!checked }))
                                }
                            />
                            <Label htmlFor="manage_stock">Manage stock?</Label>
                        </div>

                        {values.manage_stock && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                                    <Input
                                        id="stock_quantity"
                                        type="number"
                                        min={0}
                                        value={values.stock_quantity}
                                        onChange={(e) =>
                                            setValues((p) => ({ ...p, stock_quantity: Number(e.target.value) }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stock Status</Label>
                                    <Select
                                        value={values.stock_status}
                                        onValueChange={(v) => setValues((p) => ({ ...p, stock_status: v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="instock">In Stock</SelectItem>
                                            <SelectItem value="outofstock">Out of Stock</SelectItem>
                                            <SelectItem value="onbackorder">On Backorder</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {!values.manage_stock && (
                            <div className="space-y-2">
                                <Label>Stock Status</Label>
                                <Select
                                    value={values.stock_status}
                                    onValueChange={(v) => setValues((p) => ({ ...p, stock_status: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instock">In Stock</SelectItem>
                                        <SelectItem value="outofstock">Out of Stock</SelectItem>
                                        <SelectItem value="onbackorder">On Backorder</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border p-4 space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Description</h3>

                        <div className="space-y-2">
                            <Label htmlFor="short_description">Short Description</Label>
                            <textarea
                                id="short_description"
                                value={values.short_description}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setValues((p) => ({ ...p, short_description: e.target.value }))}
                                rows={3}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Full Description</Label>
                            <textarea
                                id="description"
                                value={values.description}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setValues((p) => ({ ...p, description: e.target.value }))}
                                rows={6}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border p-4 space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
                        {categories.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No categories found.</p>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {categories.map((cat) => (
                                    <label
                                        key={cat.id}
                                        className="flex items-center gap-2 cursor-pointer text-sm"
                                    >
                                        <Checkbox
                                            checked={selectedCategories.includes(cat.id)}
                                            onCheckedChange={() => toggleCategory(cat.id)}
                                        />
                                        {cat.name}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border p-4 space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                        {tags.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No tags found.</p>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {tags.map((tag) => (
                                    <label
                                        key={tag.id}
                                        className="flex items-center gap-2 cursor-pointer text-sm"
                                    >
                                        <Checkbox
                                            checked={selectedTags.includes(tag.id)}
                                            onCheckedChange={() => toggleTag(tag.id)}
                                        />
                                        {tag.name}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Images</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addImage}>
                                + Add Image
                            </Button>
                        </div>
                        {images.length === 0 && (
                            <p className="text-sm text-muted-foreground">No images added yet.</p>
                        )}
                        {images.map((img, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                {img.src && (
                                    <img
                                        src={img.src}
                                        alt=""
                                        className="size-10 rounded border object-cover shrink-0"
                                    />
                                )}
                                <Input
                                    value={img.src}
                                    onChange={(e) =>
                                        setImages((prev) =>
                                            prev.map((item, i) =>
                                                i === idx ? { ...item, src: e.target.value } : item,
                                            ),
                                        )
                                    }
                                    placeholder="https://example.com/image.jpg"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeImage(idx)}
                                    className="text-red-500"
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        {errors['images.0.src'] && (
                            <p className="text-xs text-red-500">{errors['images.0.src']}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Update Product'}
                        </Button>
                        <Link href="/admin/woocommerce/products">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}
