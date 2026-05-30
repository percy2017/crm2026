import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Printer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/woocommerce/pos/product-grid';
import { CartPanel } from '@/components/woocommerce/pos/cart-panel';
import { RecentOrdersBar } from '@/components/woocommerce/pos/recent-orders-bar';
import type { WooPaginatedResponse, WooProduct } from '@/types';

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

type Category = {
    id: number;
    name: string;
    slug: string;
};

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

    const [orderSuccess, setOrderSuccess] = useState<{ number: string; total: string } | null>(null);

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
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);

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

    const addToCart = (product: WooProduct) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        setOrderSuccess(null);
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.product.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
                )
                .filter((item) => item.quantity > 0),
        );
    };

    const removeItem = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setPaying(true);

        const lineItems = cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
        }));

        const parts = customer?.name.split(' ') ?? [];
        const payload: Record<string, unknown> = {
            line_items: lineItems,
            payment_method: paymentMethod,
            payment_method_title: paymentGateways.find((g) => g.id === paymentMethod)?.title ?? paymentMethod,
            customer_note: 'POS sale',
            billing: customer
                ? {
                      first_name: parts[0] ?? '',
                      last_name: parts.slice(1).join(' ') ?? '',
                      email: customer.email ?? '',
                      phone: customer.phone ?? '',
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
        setOrderSuccess(null);
    };

    const handlePrint = () => {
        const order = orderSuccess;
        if (!order) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const items = cart.length > 0 ? cart : [];

        printWindow.document.write(`
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
                            <td>${item.product.name}</td>
                            <td class="right">${item.quantity}</td>
                            <td class="right">${(Number(item.product.price) * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </table>
                <hr>
                <p class="right total">Total: Bs ${order.total}</p>
                <hr>
                <p class="center">¡Gracias por su compra!</p>
                <script>window.print(); window.close();</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <>
            <Head title="POS — WooCommerce" />

            <div className="flex h-full flex-1 flex-col gap-3 rounded-xl p-4 min-h-0">
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">POS</h1>
                        {orderSuccess ? (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle2 className="size-4" />
                                Orden #{orderSuccess.number} creada
                            </span>
                        ) : (
                            <span className="text-sm text-muted-foreground">Point of Sale</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {orderSuccess && (
                            <>
                                <Button variant="outline" size="sm" onClick={handlePrint}>
                                    <Printer className="size-4 mr-1" /> Imprimir
                                </Button>
                                <Button variant="default" size="sm" onClick={newOrder}>
                                    <RotateCcw className="size-4 mr-1" /> Nueva Orden
                                </Button>
                            </>
                        )}
                    </div>
                </div>

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
                                onUpdateQuantity={updateQuantity}
                                onRemoveItem={removeItem}
                                onCustomerSelect={setCustomer}
                                onCustomerClear={() => setCustomer(null)}
                                onPaymentMethodChange={setPaymentMethod}
                                onCheckout={handleCheckout}
                                paying={paying}
                            />
                        </div>
                    </div>
                )}

                <div className="shrink-0">
                    <RecentOrdersBar onRefetch={() => {}} />
                </div>
            </div>
        </>
    );
}
