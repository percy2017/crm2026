import { ShoppingCart, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WooProduct } from '@/types';

type Props = {
    product: WooProduct;
    onAdd: (product: WooProduct) => void;
};

const stockLabels: Record<string, { label: string; class: string }> = {
    instock: { label: 'En stock', class: 'bg-green-100 text-green-700' },
    outofstock: { label: 'Agotado', class: 'bg-red-100 text-red-700' },
    onbackorder: { label: 'Backorder', class: 'bg-blue-100 text-blue-700' },
};

export function ProductCard({ product, onAdd }: Props) {
    const image = product.images[0]?.src;
    const category = product.categories[0];
    const brand = product.brands?.[0];
    const tags = product.tags?.filter((t) => t.name) ?? [];
    const stock = stockLabels[product.stock_status] ?? stockLabels.instock;

    return (
        <button
            type="button"
            onClick={() => onAdd(product)}
            className="group flex flex-col rounded-xl border bg-card p-3 text-left transition-all hover:border-primary hover:shadow-md cursor-pointer"
        >
            <div className="relative mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-muted">
                {image ? (
                    <img src={image} alt={product.name} className="size-full object-cover" />
                ) : (
                    <PackageOpen className="size-8 text-muted-foreground" />
                )}
                <div className="absolute top-1 right-1 flex flex-col gap-1">
                    {product.type === 'variable' && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                            Variable
                        </span>
                    )}
                    {product.stock_status !== 'instock' && (
                        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', stock.class)}>
                            {stock.label}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex-1 space-y-0.5">
                {product.sku && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{product.sku}</p>
                )}
                <p className="text-sm font-medium leading-tight line-clamp-2">{product.name}</p>
                {category && category.name !== 'Sin categorizar' && (
                    <p className="text-[11px] text-muted-foreground">{category.name}</p>
                )}
                {brand && (
                    <p className="text-[11px] text-muted-foreground">{brand.name}</p>
                )}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                        {tags.map((t) => (
                            <span
                                key={t.id}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                                {t.name}
                            </span>
                        ))}
                    </div>
                )}
                {product.type !== 'variable' && (
                    <p className="text-base font-bold text-primary">
                        Bs {product.sale_price || product.regular_price || product.price}
                    </p>
                )}
            </div>
            <div className="mt-2">
                <Button
                    size="sm"
                    className="w-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd(product);
                    }}
                >
                    {product.type === 'variable' ? 'Seleccionar' : 'Agregar'}
                </Button>
            </div>
        </button>
    );
}
