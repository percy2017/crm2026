import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CustomerSearch } from './customer-search';
import type { WooProduct } from '@/types';

type CartItem = {
    product: WooProduct;
    quantity: number;
};

type PaymentGateway = {
    id: string;
    title: string;
    description?: string;
};

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    profile_pic_url: string | null;
};

type Props = {
    items: CartItem[];
    customer: Customer | null;
    paymentMethod: string;
    paymentGateways: PaymentGateway[];
    onUpdateQuantity: (productId: number, delta: number) => void;
    onRemoveItem: (productId: number) => void;
    onCustomerSelect: (customer: Customer) => void;
    onCustomerClear: () => void;
    onPaymentMethodChange: (method: string) => void;
    onCheckout: () => void;
    paying: boolean;
};

export function CartPanel({
    items,
    customer,
    paymentMethod,
    paymentGateways,
    onUpdateQuantity,
    onRemoveItem,
    onCustomerSelect,
    onCustomerClear,
    onPaymentMethodChange,
    onCheckout,
    paying,
}: Props) {
    const subtotal = items.reduce((sum, item) => sum + Number.parseFloat(item.product.price || '0') * item.quantity, 0);
    const total = subtotal;

    return (
        <div className="flex h-full flex-col gap-3">
            <CustomerSearch customer={customer} onSelect={onCustomerSelect} onClear={onCustomerClear} />

            <div className="flex-1 space-y-1 overflow-y-auto min-h-0 rounded-lg border p-2">
                {items.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Carrito vacío</p>
                ) : (
                    items.map((item) => {
                        const price = Number.parseFloat(item.product.price || '0');
                        return (
                            <div
                                key={item.product.id}
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-6"
                                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                                    >
                                        <Minus className="size-3" />
                                    </Button>
                                    <span className="w-6 text-center text-sm font-medium tabular-nums">
                                        {item.quantity}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-6"
                                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                                    >
                                        <Plus className="size-3" />
                                    </Button>
                                </div>
                                <p className="w-16 text-right text-sm font-medium tabular-nums shrink-0">
                                    {(price * item.quantity).toFixed(2)}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6 shrink-0 text-muted-foreground hover:text-red-500"
                                    onClick={() => onRemoveItem(item.product.id)}
                                >
                                    <Trash2 className="size-3" />
                                </Button>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="space-y-2 rounded-lg border p-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium tabular-nums">Bs {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold tabular-nums text-primary">Bs {total.toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Método de pago</p>
                <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {paymentGateways.map((gw) => (
                            <SelectItem key={gw.id} value={gw.id}>
                                {gw.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button
                className="w-full py-6 text-base font-bold"
                disabled={items.length === 0 || paying}
                onClick={onCheckout}
            >
                {paying ? 'Procesando...' : `Cobrar Bs ${total.toFixed(2)}`}
            </Button>
        </div>
    );
}
