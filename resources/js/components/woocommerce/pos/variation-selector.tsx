import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WooProduct } from '@/types';

export type WooVariation = {
    id: number;
    price: string;
    regular_price: string;
    sale_price: string;
    sku: string;
    stock_quantity: number | null;
    stock_status: string;
    manage_stock: boolean;
    image: { src: string } | null;
    attributes: { id: number; name: string; option: string }[];
};

type Props = {
    product: WooProduct | null;
    open: boolean;
    onClose: () => void;
    onSelect: (product: WooProduct, variation: WooVariation) => void;
};

const stockLabels: Record<string, { label: string; class: string }> = {
    instock: { label: 'Stock', class: 'text-green-600' },
    outofstock: { label: 'Agotado', class: 'text-red-600' },
    onbackorder: { label: 'Backorder', class: 'text-blue-600' },
};

export function VariationSelector({ product, open, onClose, onSelect }: Props) {
    const [variations, setVariations] = useState<WooVariation[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !product || product.type !== 'variable') return;

        setLoading(true);

        fetch(`/admin/woocommerce/products/${product.id}/variations`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((json) => setVariations(json.data ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open, product]);

    const handleSelect = (variation: WooVariation) => {
        if (!product) return;
        onSelect(product, variation);
        onClose();
    };

    const category = product?.categories[0]?.name;
    const brand = product?.brands?.[0]?.name;

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{product?.name}</DialogTitle>
                    {(category || brand) && (
                        <p className="text-xs text-muted-foreground">
                            {[category, brand].filter(Boolean).join(' · ')}
                        </p>
                    )}
                </DialogHeader>

                {loading ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Cargando variaciones...</p>
                ) : variations.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Sin variaciones disponibles</p>
                ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {variations.map((v) => {
                            const price = v.sale_price || v.regular_price || v.price;
                            const attrLabel = v.attributes.map((a) => a.option).join(', ');
                            const stock = stockLabels[v.stock_status] ?? stockLabels.instock;

                            return (
                                <button
                                    key={v.id}
                                    type="button"
                                    disabled={v.stock_status === 'outofstock'}
                                    onClick={() => handleSelect(v)}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all hover:border-primary hover:bg-accent cursor-pointer',
                                        v.stock_status === 'outofstock' && 'opacity-50 cursor-not-allowed',
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{attrLabel}</p>
                                        {v.sku && (
                                            <p className="text-xs text-muted-foreground">{v.sku}</p>
                                        )}
                                        <p className={cn('text-xs', stock.class)}>
                                            {stock.label}
                                            {v.manage_stock && v.stock_quantity !== null && `: ${v.stock_quantity}`}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-base font-bold text-primary">Bs {price}</p>
                                    </div>
                                    {v.stock_status !== 'outofstock' && (
                                        <ShoppingCart className="size-4 shrink-0 text-muted-foreground" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                <Button variant="ghost" className="w-full" onClick={onClose}>
                    Cancelar
                </Button>
            </DialogContent>
        </Dialog>
    );
}
