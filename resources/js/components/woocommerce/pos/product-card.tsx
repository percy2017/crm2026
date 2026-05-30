import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WooProduct } from '@/types';

type Props = {
    product: WooProduct;
    onAdd: (product: WooProduct) => void;
};

export function ProductCard({ product, onAdd }: Props) {
    const image = product.images[0]?.src;

    return (
        <button
            type="button"
            onClick={() => onAdd(product)}
            className="group flex flex-col rounded-xl border bg-card p-3 text-left transition-all hover:border-primary hover:shadow-md cursor-pointer"
        >
            <div className="mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-muted">
                {image ? (
                    <img src={image} alt={product.name} className="size-full object-cover" />
                ) : (
                    <ShoppingCart className="size-8 text-muted-foreground" />
                )}
            </div>
            <div className="flex-1 space-y-1">
                <p className="text-xs text-muted-foreground line-clamp-1">{product.sku || product.name}</p>
                <p className="text-sm font-medium leading-tight line-clamp-2">{product.name}</p>
                <p className="text-base font-bold text-primary">
                    {product.sale_price || product.regular_price || product.price}
                </p>
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
                    Agregar
                </Button>
            </div>
        </button>
    );
}
