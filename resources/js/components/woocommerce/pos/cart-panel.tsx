import { Minus, Plus, Tag, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CustomerSearch } from './customer-search';
import type { CartItem } from '@/pages/admin/woocommerce/pos';

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
    coupons: string[];
    saleType: 'direct' | 'subscription';
    purchaseDate: string;
    subscriptionTitle: string;
    subscriptionEndDate: string;
    onUpdateQuantity: (cartId: string, delta: number) => void;
    onRemoveItem: (cartId: string) => void;
    onUpdatePrice: (cartId: string, newPrice: number) => void;
    onCustomerSelect: (customer: Customer) => void;
    onCustomerClear: () => void;
    onPaymentMethodChange: (method: string) => void;
    onApplyCoupon: (code: string) => void;
    onRemoveCoupon: (code: string) => void;
    onSaleTypeChange: (type: 'direct' | 'subscription') => void;
    onPurchaseDateChange: (date: string) => void;
    onSubscriptionTitleChange: (title: string) => void;
    onSubscriptionEndDateChange: (date: string) => void;
    onCheckout: () => void;
    paying: boolean;
};

function PriceInput({ value, quantity, onChange }: { value: number; quantity: number; onChange: (v: number) => void }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(value.toFixed(2));

    const handleBlur = () => {
        setEditing(false);
        const parsed = Number.parseFloat(text);
        if (!Number.isNaN(parsed) && parsed >= 0) {
            onChange(parsed);
        } else {
            setText(value.toFixed(2));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
        if (e.key === 'Escape') {
            setText(value.toFixed(2));
            setEditing(false);
        }
    };

    if (editing) {
        return (
            <Input
                className="h-7 w-20 text-right text-sm font-medium tabular-nums px-1.5"
                value={text}
                autoFocus
                onChange={(e) => setText(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
        );
    }

    return (
        <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-20 text-right text-sm font-medium tabular-nums shrink-0 hover:text-primary transition-colors cursor-text"
        >
            {(value * quantity).toFixed(2)}
        </button>
    );
}

export function CartPanel({
    items,
    customer,
    paymentMethod,
    paymentGateways,
    coupons,
    saleType,
    purchaseDate,
    subscriptionTitle,
    subscriptionEndDate,
    onUpdateQuantity,
    onRemoveItem,
    onUpdatePrice,
    onCustomerSelect,
    onCustomerClear,
    onPaymentMethodChange,
    onApplyCoupon,
    onRemoveCoupon,
    onSaleTypeChange,
    onPurchaseDateChange,
    onSubscriptionTitleChange,
    onSubscriptionEndDateChange,
    onCheckout,
    paying,
}: Props) {
    const [couponInput, setCouponInput] = useState('');

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal;

    const handleApplyCoupon = () => {
        if (couponInput.trim()) {
            onApplyCoupon(couponInput);
            setCouponInput('');
        }
    };

    const canCheckout = items.length > 0 && (!(saleType === 'subscription') || (subscriptionTitle.trim() && subscriptionEndDate));

    return (
        <div className="flex h-full flex-col gap-3">
            <CustomerSearch customer={customer} onSelect={onCustomerSelect} onClear={onCustomerClear} />

            <div className="flex-1 space-y-1 overflow-y-auto min-h-0 rounded-lg border p-2">
                {items.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Carrito vacío</p>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.label}</p>
                                {item.variation && (
                                    <p className="text-xs text-muted-foreground">SKU: {item.variation.sku}</p>
                                )}
                                {!item.variation && <p className="text-xs text-muted-foreground">{item.product.sku}</p>}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6"
                                    onClick={() => onUpdateQuantity(item.id, -1)}
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
                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                >
                                    <Plus className="size-3" />
                                </Button>
                            </div>
                            <PriceInput
                                value={item.price}
                                quantity={item.quantity}
                                onChange={(v) => onUpdatePrice(item.id, v)}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 shrink-0 text-muted-foreground hover:text-red-500"
                                onClick={() => onRemoveItem(item.id)}
                            >
                                <Trash2 className="size-3" />
                            </Button>
                        </div>
                    ))
                )}
            </div>

            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Tipo de venta</p>
                <div className="flex gap-1.5">
                    <Button
                        variant={saleType === 'direct' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => onSaleTypeChange('direct')}
                    >
                        Directa
                    </Button>
                    <Button
                        variant={saleType === 'subscription' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => onSaleTypeChange('subscription')}
                    >
                        Suscripción
                    </Button>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Fecha de compra</p>
                <Input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => onPurchaseDateChange(e.target.value)}
                    className="h-8 text-sm"
                />
            </div>

            {saleType === 'subscription' && (
                <div className="space-y-1.5 rounded-lg border p-2.5">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Título</p>
                        <Input
                            placeholder="Ej: Netflix Premium - 1 mes"
                            value={subscriptionTitle}
                            onChange={(e) => onSubscriptionTitleChange(e.target.value)}
                            className="h-8 text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Fecha culminación</p>
                        <Input
                            type="date"
                            value={subscriptionEndDate}
                            onChange={(e) => onSubscriptionEndDateChange(e.target.value)}
                            className="h-8 text-sm"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-2 rounded-lg border p-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium tabular-nums">Bs {subtotal.toFixed(2)}</span>
                </div>

                {coupons.length > 0 && (
                    <div className="space-y-1">
                        {coupons.map((code) => (
                            <div key={code} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Tag className="size-3.5 text-blue-500" />
                                    <span className="font-medium text-blue-600">{code}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemoveCoupon(code)}
                                    className="text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-between border-t pt-2 text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold tabular-nums text-primary">Bs {total.toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Cupón</p>
                <div className="flex gap-1.5">
                    <Input
                        placeholder="Código"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
                        className="h-8 text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={handleApplyCoupon} className="shrink-0 h-8">
                        <Tag className="size-3.5 mr-1" /> OK
                    </Button>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Método de pago</p>
                <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
                    <SelectTrigger className="w-full">
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
                disabled={!canCheckout || paying}
                onClick={onCheckout}
            >
                {paying ? 'Procesando...' : `Cobrar Bs ${total.toFixed(2)}`}
            </Button>
        </div>
    );
}
