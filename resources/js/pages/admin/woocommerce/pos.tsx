import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Printer, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CartPanel } from '@/components/woocommerce/pos/cart-panel';
import { ProductGrid } from '@/components/woocommerce/pos/product-grid';
import { VariationSelector  } from '@/components/woocommerce/pos/variation-selector';
import type {WooVariation} from '@/components/woocommerce/pos/variation-selector';
import type { WooPaginatedResponse, WooProduct } from '@/types';

export type CartItem = {
    id: string;
    product: WooProduct;
    variation: WooVariation | null;
    quantity: number;
    label: string;
    price: number;
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

type Category = {
    id: number;
    name: string;
    slug: string;
};

let cartIdCounter = 0;
function nextCartId() {
    return `cart_${++cartIdCounter}`;
}

export default function WooPos({
    categories,
    paymentGateways,
}: {
    categories: Category[];
    paymentGateways: PaymentGateway[];
}) {
    const [products, setProducts] = useState<WooProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [paymentMethod, setPaymentMethod] = useState(paymentGateways[0]?.id ?? 'cod');
    const [paying, setPaying] = useState(false);
    const [coupons, setCoupons] = useState<string[]>([]);

    const [saleType, setSaleType] = useState<'direct' | 'subscription'>('direct');
    const [subscriptionTitle, setSubscriptionTitle] = useState('');
    const [subscriptionEndDate, setSubscriptionEndDate] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));

    const [orderSuccess, setOrderSuccess] = useState<{ number: string; total: string } | null>(null);

    const [variationProduct, setVariationProduct] = useState<WooProduct | null>(null);

    const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);

        return () => clearTimeout(searchTimer.current);
    }, [search]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({
            per_page: '20',
            page: String(page),
        });

        if (debouncedSearch) {
params.set('search', debouncedSearch);
}

        if (selectedCategory && selectedCategory !== 'all') {
params.set('category', selectedCategory);
}

        try {
            const res = await fetch(`/admin/woocommerce/products?${params}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (res.ok) {
                const json: WooPaginatedResponse<WooProduct> = await res.json();
                setProducts(json.data);
                setTotalPages(json.meta.total_pages);
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, selectedCategory, page]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddSimpleProduct = (product: WooProduct) => {
        const existing = cart.find(
            (item) => item.product.id === product.id && item.variation === null,
        );

        if (existing) {
            setCart((prev) =>
                prev.map((item) =>
                    item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item,
                ),
            );
        } else {
            setCart((prev) => [
                ...prev,
                {
                    id: nextCartId(),
                    product,
                    variation: null,
                    quantity: 1,
                    label: product.name,
                    price: Number.parseFloat(product.price || '0'),
                },
            ]);
        }

        setOrderSuccess(null);
    };

    const handleAddVariableProduct = (product: WooProduct, variation: WooVariation) => {
        const price = Number.parseFloat(variation.sale_price || variation.regular_price || variation.price || '0');
        const attrLabel = variation.attributes.map((a) => a.option).join(', ');
        const label = `${product.name} — ${attrLabel}`;

        const existing = cart.find(
            (item) => item.product.id === product.id && item.variation?.id === variation.id,
        );

        if (existing) {
            setCart((prev) =>
                prev.map((item) =>
                    item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item,
                ),
            );
        } else {
            setCart((prev) => [
                ...prev,
                {
                    id: nextCartId(),
                    product,
                    variation,
                    quantity: 1,
                    label,
                    price,
                },
            ]);
        }

        setOrderSuccess(null);
    };

    const addToCart = (product: WooProduct) => {
        if (product.type === 'variable') {
            setVariationProduct(product);

            return;
        }

        handleAddSimpleProduct(product);
    };

    const updateQuantity = (cartId: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.id === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
                )
                .filter((item) => item.quantity > 0),
        );
    };

    const removeItem = (cartId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== cartId));
    };

    const updatePrice = (cartId: string, newPrice: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === cartId ? { ...item, price: Math.max(0, newPrice) } : item,
            ),
        );
    };

    const addCoupon = (code: string) => {
        const trimmed = code.trim().toUpperCase();

        if (trimmed && !coupons.includes(trimmed)) {
            setCoupons((prev) => [...prev, trimmed]);
        }
    };

    const removeCoupon = (code: string) => {
        setCoupons((prev) => prev.filter((c) => c !== code));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
return;
}

        setPaying(true);

        const lineItems = cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            ...(item.variation ? { variation_id: item.variation.id } : {}),
        }));

        const parts = customer?.name.trim().split(/\s+/) ?? [];
        const payload: Record<string, unknown> = {
            line_items: lineItems,
            payment_method: paymentMethod,
            payment_method_title: paymentGateways.find((g) => g.id === paymentMethod)?.title ?? paymentMethod,
            customer_note: 'POS sale',
            coupon_lines: coupons.map((code) => ({ code })),
            sale_type: saleType,
            date_created: purchaseDate,
            ...(saleType === 'subscription' && {
                subscription_title: subscriptionTitle,
                subscription_end_date: subscriptionEndDate,
            }),
            billing: customer
                ? {
                      first_name: parts[0] || 'Cliente',
                      last_name: parts.slice(1).join(' ') || '',
                      email: customer.email ?? '',
                      phone: customer.phone ?? '',
                      contact_id: customer.id,
                  }
                : undefined,
        };

        try {
            const res = await fetch('/admin/woocommerce/pos/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error ?? 'Error al crear la orden');

                return;
            }

            const data = await res.json();
            const order = data.data;
            setOrderSuccess({ number: order.number ?? String(order.id), total: order.total ?? '0.00' });
            setCart([]);
            setCustomer(null);
        } catch {
            alert('Error de conexión');
        } finally {
            setPaying(false);
        }
    };

    const newOrder = () => {
        setCart([]);
        setCustomer(null);
        setCoupons([]);
        setOrderSuccess(null);
        setSaleType('direct');
        setSubscriptionTitle('');
        setSubscriptionEndDate('');
    };

    const handlePrint = () => {
        const order = orderSuccess;

        if (!order) {
return;
}

        const items = cart.length > 0 ? cart : [];

        const html = `
            <html>
            <head><title>Ticket #${order.number}</title>
            <style>
                @page { margin: 0; size: 80mm auto; }
                body { font-family: monospace; font-size: 12px; width: 80mm; margin: 0; padding: 10px; }
                h1 { text-align: center; font-size: 16px; }
                hr { border: none; border-top: 1px dashed #000; }
                table { width: 100%; border-collapse: collapse; }
                th, td { text-align: left; padding: 2px 0; }
                .right { text-align: right; }
                .total { font-size: 16px; font-weight: bold; }
                .center { text-align: center; }
            </style>
            </head>
            <body>
                <h1>Tienda</h1>
                <p class="center">Orden #${order.number}</p>
                <hr>
                <table>
                    <tr><th>Item</th><th class="right">Cant</th><th class="right">Total</th></tr>
                    ${items.map(item => `
                        <tr>
                            <td>${item.label}</td>
                            <td class="right">${item.quantity}</td>
                            <td class="right">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </table>
                <hr>
                <p class="right total">Total: Bs ${order.total}</p>
                <hr>
                <p class="center">¡Gracias por su compra!</p>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');

        if (!printWindow) {
return;
}

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onafterprint = () => printWindow.close();
        printWindow.print();
    };

    return (
        <>
            <Head title="POS — WooCommerce" />

            <div className="flex h-full flex-1 flex-col gap-3 rounded-xl p-4 min-h-0">
                {orderSuccess && (
                    <div className="flex items-center justify-end gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="size-4 mr-1" /> Imprimir
                        </Button>
                        <Button variant="default" size="sm" onClick={newOrder}>
                            <RotateCcw className="size-4 mr-1" /> Nueva Orden
                        </Button>
                    </div>
                )}

                {orderSuccess ? (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="text-center space-y-4">
                            <CheckCircle2 className="mx-auto size-16 text-green-500" />
                            <h2 className="text-2xl font-bold">¡Orden Completada!</h2>
                            <p className="text-lg text-muted-foreground">
                                Orden #{orderSuccess.number} — Total: <span className="font-bold text-primary">Bs {orderSuccess.total}</span>
                            </p>
                            <div className="flex justify-center gap-3 pt-4">
                                <Button variant="outline" onClick={handlePrint}>
                                    <Printer className="size-4 mr-2" /> Imprimir Ticket
                                </Button>
                                <Button onClick={newOrder}>
                                    <RotateCcw className="size-4 mr-2" /> Nueva Orden
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
                        <div className="col-span-2 flex flex-col min-h-0">
                            <ProductGrid
                                products={products}
                                loading={loading}
                                search={search}
                                onSearchChange={setSearch}
                                selectedCategory={selectedCategory}
                                onCategoryChange={(v) => {
                                    setSelectedCategory(v);
                                    setPage(1);
                                }}
                                categories={categories}
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                                onAddProduct={addToCart}
                            />
                        </div>

                        <div className="col-span-1 flex flex-col min-h-0">
                            <CartPanel
                                items={cart}
                                customer={customer}
                                paymentMethod={paymentMethod}
                                paymentGateways={paymentGateways}
                                coupons={coupons}
                                saleType={saleType}
                                purchaseDate={purchaseDate}
                                subscriptionTitle={subscriptionTitle}
                                subscriptionEndDate={subscriptionEndDate}
                                onUpdateQuantity={updateQuantity}
                                onRemoveItem={removeItem}
                                onUpdatePrice={updatePrice}
                                onCustomerSelect={setCustomer}
                                onCustomerClear={() => setCustomer(null)}
                                onPaymentMethodChange={setPaymentMethod}
                                onApplyCoupon={addCoupon}
                                onRemoveCoupon={removeCoupon}
                                onSaleTypeChange={setSaleType}
                                onPurchaseDateChange={setPurchaseDate}
                                onSubscriptionTitleChange={setSubscriptionTitle}
                                onSubscriptionEndDateChange={setSubscriptionEndDate}
                                onCheckout={handleCheckout}
                                paying={paying}
                            />
                        </div>
                    </div>
                )}
            </div>

            <VariationSelector
                product={variationProduct}
                open={variationProduct !== null}
                onClose={() => setVariationProduct(null)}
                onSelect={handleAddVariableProduct}
            />
        </>
    );
}
