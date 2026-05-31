<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Codexshaper\WooCommerce\Facades\Category;
use Codexshaper\WooCommerce\Facades\Order;
use Codexshaper\WooCommerce\Facades\PaymentGateway;
use Codexshaper\WooCommerce\Facades\Product;
use Codexshaper\WooCommerce\Facades\Report;
use Codexshaper\WooCommerce\Facades\Tag;
use Codexshaper\WooCommerce\Facades\Variation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminWooCommerceController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('admin/woocommerce/index');
    }

    public function dashboardData(): JsonResponse
    {
        try {
            $sales = Report::sales();
            $topSellersData = Report::topSellers();
            $totalProducts = Product::count();
            $totalOrders = Order::count();
            $salesReport = is_array($sales) ? ($sales[0] ?? $sales) : [];
            $totalSales = $salesReport['total_sales'] ?? '0.00';
            $netSales = $salesReport['net_sales'] ?? '0.00';
            $totalOrdersCount = (int) ($salesReport['total_orders'] ?? $totalOrders);
            $avgOrderValue = $totalOrdersCount > 0
                ? number_format((float) $netSales / $totalOrdersCount, 2)
                : '0.00';

            $topSellers = [];
            if (is_array($topSellersData)) {
                foreach ($topSellersData as $item) {
                    $topSellers[] = [
                        'id' => $item['product_id'] ?? 0,
                        'name' => $item['name'] ?? 'Unknown',
                        'quantity' => (int) ($item['quantity'] ?? 0),
                        'total' => $item['total'] ?? '0.00',
                    ];
                }
            }

            $recentOrders = collect(Order::all(['per_page' => 5, 'orderby' => 'date', 'order' => 'desc']))
                ->map(fn ($o) => $this->formatOrder($o));

            return response()->json([
                'total_sales' => $totalSales,
                'total_orders' => $totalOrdersCount,
                'total_products' => $totalProducts,
                'net_sales' => $netSales,
                'avg_order_value' => $avgOrderValue,
                'top_sellers' => $topSellers,
                'recent_orders' => $recentOrders,
            ]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function products(Request $request): Response|JsonResponse
    {
        if (!$request->wantsJson()) {
            return Inertia::render('admin/woocommerce/products/index');
        }

        try {
            $perPage = (int) $request->input('per_page', 20);
            $page = (int) $request->input('page', 1);
            $search = $request->input('search', '');
            $sortBy = $request->input('sort_by', 'date');
            $sortDir = $request->input('sort_dir', 'desc');

            $options = [
                'orderby' => $sortBy,
                'order' => $sortDir,
            ];

            if ($search) {
                $options['search'] = $search;
            }

            if ($request->has('status')) {
                $options['status'] = $request->input('status');
            }

            if ($request->has('type')) {
                $options['type'] = $request->input('type');
            }

            $result = Product::paginate($perPage, $page, $options);

            return response()->json($result);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function productShow(int $id): JsonResponse
    {
        try {
            $product = Product::withOriginal()->find($id);

            return response()->json(['data' => $product]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function productCreate(): Response
    {
        $categories = Category::all();
        $tags = Tag::all();

        return Inertia::render('admin/woocommerce/products/create', [
            'categories' => $categories,
            'tags' => $tags,
        ]);
    }

    public function productStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:simple,variable,grouped,external',
            'regular_price' => 'required|string',
            'sale_price' => 'nullable|string',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'sku' => 'nullable|string|max:100',
            'stock_status' => 'nullable|string|in:instock,outofstock,onbackorder',
            'stock_quantity' => 'nullable|integer|min:0',
            'manage_stock' => 'nullable|boolean',
            'status' => 'nullable|string|in:draft,pending,publish',
            'categories' => 'nullable|array',
            'categories.*.id' => 'required_with:categories|integer',
            'tags' => 'nullable|array',
            'tags.*.id' => 'required_with:tags|integer',
            'images' => 'nullable|array',
            'images.*.src' => 'required_with:images|url',
        ]);

        try {
            Product::create($validated);

            return redirect()->route('admin.woocommerce.products')->with('success', 'Product created successfully.');
        } catch (\Exception $e) {
            report($e);

            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function productEdit(int $id): Response
    {
        $product = Product::withOriginal()->find($id);
        $categories = Category::all();
        $tags = Tag::all();

        return Inertia::render('admin/woocommerce/products/edit', [
            'product' => $product,
            'categories' => $categories,
            'tags' => $tags,
        ]);
    }

    public function productUpdate(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:simple,variable,grouped,external',
            'regular_price' => 'required|string',
            'sale_price' => 'nullable|string',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'sku' => 'nullable|string|max:100',
            'stock_status' => 'nullable|string|in:instock,outofstock,onbackorder',
            'stock_quantity' => 'nullable|integer|min:0',
            'manage_stock' => 'nullable|boolean',
            'status' => 'nullable|string|in:draft,pending,publish',
            'categories' => 'nullable|array',
            'categories.*.id' => 'required_with:categories|integer',
            'tags' => 'nullable|array',
            'tags.*.id' => 'required_with:tags|integer',
            'images' => 'nullable|array',
            'images.*.src' => 'required_with:images|url',
        ]);

        try {
            Product::update($id, $validated);

            return redirect()->route('admin.woocommerce.products')->with('success', 'Product updated successfully.');
        } catch (\Exception $e) {
            report($e);

            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function productDestroy(int $id): JsonResponse
    {
        try {
            Product::delete($id, ['force' => true]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function productVariations(int $id): JsonResponse
    {
        try {
            $variations = Variation::all($id, ['per_page' => 100]);

            return response()->json(['data' => $variations]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function pos(): Response
    {
        $categories = Category::all();
        $paymentGateways = collect(PaymentGateway::all())->map(fn ($g) => (array) $g)->filter(fn ($g) => $g['enabled'] ?? false)->values();

        return Inertia::render('admin/woocommerce/pos', [
            'categories' => $categories,
            'paymentGateways' => $paymentGateways,
        ]);
    }

    public function posCreateOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'line_items' => 'required|array',
            'line_items.*.product_id' => 'required|integer',
            'line_items.*.quantity' => 'required|integer|min:1',
            'line_items.*.variation_id' => 'nullable|integer',
            'payment_method' => 'required|string',
            'payment_method_title' => 'required|string',
            'customer_note' => 'nullable|string',
            'billing' => 'nullable|array',
            'coupon_lines' => 'nullable|array',
            'coupon_lines.*.code' => 'required_with:coupon_lines|string',
            'sale_type' => 'nullable|string|in:direct,subscription',
            'subscription_title' => 'nullable|string|max:255',
            'subscription_end_date' => 'nullable|date',
            'date_created' => 'nullable|date',
        ]);

        try {
            $lineItems = array_map(fn ($item) => array_filter([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'variation_id' => $item['variation_id'] ?? 0,
            ]), $validated['line_items']);

            $data = [
                'payment_method' => $validated['payment_method'],
                'payment_method_title' => $validated['payment_method_title'],
                'set_paid' => true,
                'status' => 'completed',
                'line_items' => $lineItems,
            ];

            if (!empty($validated['date_created'])) {
                $data['date_created'] = $validated['date_created'];
            }

            if (!empty($validated['customer_note'])) {
                $data['customer_note'] = $validated['customer_note'];
            }

            if (!empty($validated['billing'])) {
                $data['billing'] = $validated['billing'];
            }

            if (!empty($validated['coupon_lines'])) {
                $data['coupon_lines'] = $validated['coupon_lines'];
            }

            $metaData = [];

            if (!empty($validated['billing']['contact_id'])) {
                $metaData[] = ['key' => '_contact_id', 'value' => (int) $validated['billing']['contact_id']];
            }

            if ($validated['sale_type'] === 'subscription') {
                $metaData = array_merge($metaData, [
                    ['key' => '_is_pos_subscription', 'value' => 'true'],
                    ['key' => '_subscription_title', 'value' => $validated['subscription_title'] ?? ''],
                    ['key' => '_subscription_end_date', 'value' => $validated['subscription_end_date'] ?? ''],
                    ['key' => '_subscription_start_date', 'value' => now()->toDateString()],
                ]);
            }

            if (!empty($metaData)) {
                $data['meta_data'] = $metaData;
            }

            $order = Order::create($data);

            return response()->json(['data' => $order]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function calendarSubscriptions(): JsonResponse
    {
        try {
            $events = $this->fetchSubscriptionEvents();

            return response()->json(['data' => $events]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['data' => []]);
        }
    }

    public function subscriptionsCalendarPage(): Response
    {
        $events = $this->fetchSubscriptionEvents();

        return Inertia::render('admin/woocommerce/subscriptions/calendar', [
            'events' => $events,
        ]);
    }

    private function fetchSubscriptionEvents(): array
    {
        $orders = Order::all([
            'per_page' => 100,
            'meta_key' => '_is_pos_subscription',
            'meta_value' => 'true',
        ]);

        return collect($orders)->map(function ($o) {
            $o = (array) $o;
            $billing = (array) ($o['billing'] ?? []);

            return [
                'id' => $o['id'] ?? 0,
                'title' => $this->findMeta($o, '_subscription_title') ?? 'Suscripción #'.$o['number'],
                'start' => $this->findMeta($o, '_subscription_start_date') ?? $o['date_created'],
                'end' => $this->findMeta($o, '_subscription_end_date'),
                'order_number' => $o['number'] ?? '',
                'total' => $o['total'] ?? '0.00',
                'customer_name' => ($billing['first_name'] ?? '') . ' ' . ($billing['last_name'] ?? ''),
            ];
        })->filter(fn ($e) => !empty($e['end']))->values()->toArray();
    }

    private function findMeta($order, string $key): ?string
    {
        $order = (array) $order;
        $meta = $order['meta_data'] ?? [];

        if (is_array($meta)) {
            foreach ($meta as $m) {
                $m = (array) $m;
                if (($m['key'] ?? null) === $key) {
                    return $m['value'] ?? null;
                }
            }
        }

        return null;
    }

    private function resolveContactProfilePic(array $order): ?string
    {
        $contactId = $this->findMeta($order, '_contact_id');
        if (!$contactId) {
            return null;
        }

        $contact = Contact::find((int) $contactId);
        if (!$contact || !$contact->profile_pic_url) {
            return null;
        }

        if (str_starts_with($contact->profile_pic_url, 'http')) {
            return $contact->profile_pic_url;
        }

        return asset('storage/' . $contact->profile_pic_url);
    }

    public function posContacts(Request $request): JsonResponse
    {
        $search = $request->input('search', '');

        try {
            $query = Contact::individuals()->where('is_active', true);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $contacts = $query->select('id', 'name', 'phone', 'email', 'profile_pic_url')
                ->orderBy('name')
                ->limit(20)
                ->get()
                ->map(function (Contact $contact) {
                    if ($contact->profile_pic_url) {
                        $contact->profile_pic_url =
                            str_starts_with($contact->profile_pic_url, 'http')
                            || str_starts_with($contact->profile_pic_url, '/storage/')
                                ? $contact->profile_pic_url
                                : asset('storage/'.$contact->profile_pic_url);
                    }

                    return $contact;
                });

            return response()->json(['data' => $contacts]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function posRecentOrders(): JsonResponse
    {
        try {
            $orders = Order::all(['per_page' => 10, 'orderby' => 'date', 'order' => 'desc']);

            $formatted = collect($orders)->map(function ($o) {
                $o = (array) $o;

                $lineItems = collect($o['line_items'] ?? [])
                    ->map(fn ($item) => (array) $item)
                    ->map(fn ($item) => [
                        'name' => $item['name'] ?? '',
                        'quantity' => $item['quantity'] ?? 0,
                    ])
                    ->values()
                    ->toArray();

                return [
                    'id' => $o['id'] ?? 0,
                    'number' => $o['number'] ?? '',
                    'status' => $o['status'] ?? '',
                    'total' => $o['total'] ?? '0.00',
                    'date_created' => $o['date_created'] ?? '',
                    'line_items' => $lineItems,
                ];
            });

            return response()->json(['data' => $formatted]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function orders(Request $request): Response|JsonResponse
    {
        if (!$request->wantsJson()) {
            return Inertia::render('admin/woocommerce/orders/index');
        }

        try {
            $perPage = (int) $request->input('per_page', 20);
            $page = (int) $request->input('page', 1);
            $search = $request->input('search', '');
            $sortBy = $request->input('sort_by', 'date');
            $sortDir = $request->input('sort_dir', 'desc');

            $options = [
                'orderby' => $sortBy,
                'order' => $sortDir,
            ];

            if ($search) {
                $options['search'] = $search;
            }

            if ($request->has('status')) {
                $options['status'] = $request->input('status');
            }

            $result = Order::paginate($perPage, $page, $options);

            $result['data'] = collect($result['data'])->map(fn ($o) => $this->formatOrder($o));

            return response()->json($result);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function orderShow(int $id): JsonResponse
    {
        try {
            $order = Order::withOriginal()->find($id);

            return response()->json(['data' => $this->formatOrder($order)]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function orderDestroy(int $id): JsonResponse
    {
        try {
            Order::delete($id, ['force' => true]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    private function formatOrder($order): array
    {
        $order = (array) $order;

        $mapItems = fn ($items, $fn) => collect(is_array($items) ? $items : [])
            ->map(fn ($i) => $fn((array) $i))
            ->values()
            ->toArray();

        return [
            'id' => $order['id'] ?? 0,
            'number' => $order['number'] ?? '',
            'status' => $order['status'] ?? '',
            'currency' => $order['currency'] ?? '',
            'date_created' => $order['date_created'] ?? '',
            'date_modified' => $order['date_modified'] ?? '',
            'total' => $order['total'] ?? '0.00',
            'subtotal' => $order['subtotal'] ?? '0.00',
            'total_tax' => $order['total_tax'] ?? '0.00',
            'shipping_total' => $order['shipping_total'] ?? '0.00',
            'discount_total' => $order['discount_total'] ?? '0.00',
            'payment_method' => $order['payment_method'] ?? '',
            'payment_method_title' => $order['payment_method_title'] ?? '',
            'customer_id' => $order['customer_id'] ?? 0,
            'billing' => (array) ($order['billing'] ?? []),
            'shipping' => (array) ($order['shipping'] ?? []),
            'line_items' => $mapItems($order['line_items'] ?? [], fn ($item) => [
                'id' => $item['id'] ?? 0,
                'name' => $item['name'] ?? '',
                'product_id' => $item['product_id'] ?? 0,
                'variation_id' => $item['variation_id'] ?? 0,
                'quantity' => $item['quantity'] ?? 0,
                'price' => (float) ($item['price'] ?? 0),
                'subtotal' => $item['subtotal'] ?? '0.00',
                'total' => $item['total'] ?? '0.00',
                'sku' => $item['sku'] ?? '',
            ]),
            'shipping_lines' => $mapItems($order['shipping_lines'] ?? [], fn ($s) => [
                'id' => $s['id'] ?? 0,
                'method_title' => $s['method_title'] ?? '',
                'method_id' => $s['method_id'] ?? '',
                'total' => $s['total'] ?? '0.00',
            ]),
            'coupon_lines' => $mapItems($order['coupon_lines'] ?? [], fn ($c) => [
                'id' => $c['id'] ?? 0,
                'code' => $c['code'] ?? '',
                'discount' => $c['discount'] ?? '0.00',
            ]),
            'customer_note' => $order['customer_note'] ?? '',
            'note' => $order['note'] ?? '',
            'meta_data' => $order['meta_data'] ?? [],
            'subscription_meta' => [
                'title' => $this->findMeta($order, '_subscription_title'),
                'start_date' => $this->findMeta($order, '_subscription_start_date'),
                'end_date' => $this->findMeta($order, '_subscription_end_date'),
            ],
            'contact_profile_pic_url' => $this->resolveContactProfilePic($order),
        ];
    }
}
