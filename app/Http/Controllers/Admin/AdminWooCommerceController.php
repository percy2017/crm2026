<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Codexshaper\WooCommerce\Facades\Category;
use Codexshaper\WooCommerce\Facades\Customer;
use Codexshaper\WooCommerce\Facades\Order;
use Codexshaper\WooCommerce\Facades\PaymentGateway;
use Codexshaper\WooCommerce\Facades\Product;
use Codexshaper\WooCommerce\Facades\Report;
use Codexshaper\WooCommerce\Facades\Tag;
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
            $totalCustomers = Customer::count();

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
                'total_customers' => $totalCustomers,
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

    public function productShow(int $id): Response|JsonResponse
    {
        if (request()->wantsJson()) {
            try {
                $product = Product::withOriginal()->find($id);

                return response()->json(['data' => $product]);
            } catch (\Exception $e) {
                report($e);

                return response()->json(['error' => $e->getMessage()], 422);
            }
        }

        return Inertia::render('admin/woocommerce/products/show', ['productId' => $id]);
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
            'payment_method' => 'required|string',
            'payment_method_title' => 'required|string',
            'customer_note' => 'nullable|string',
            'billing' => 'nullable|array',
        ]);

        try {
            $data = [
                'payment_method' => $validated['payment_method'],
                'payment_method_title' => $validated['payment_method_title'],
                'set_paid' => true,
                'status' => 'completed',
                'line_items' => $validated['line_items'],
            ];

            if (!empty($validated['customer_note'])) {
                $data['customer_note'] = $validated['customer_note'];
            }

            if (!empty($validated['billing'])) {
                $data['billing'] = $validated['billing'];
            }

            $order = Order::create($data);

            return response()->json(['data' => $order]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
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

            $formatted = collect($orders)->map(fn ($o) => [
                'id' => $o['id'] ?? 0,
                'number' => $o['number'] ?? '',
                'status' => $o['status'] ?? '',
                'total' => $o['total'] ?? '0.00',
                'date_created' => $o['date_created'] ?? '',
                'line_items' => collect($o['line_items'] ?? [])->map(fn ($item) => [
                    'name' => $item['name'] ?? '',
                    'quantity' => $item['quantity'] ?? 0,
                ])->values()->toArray(),
            ]);

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

    public function orderShow(int $id): Response|JsonResponse
    {
        if (request()->wantsJson()) {
            try {
                $order = Order::withOriginal()->find($id);

                return response()->json(['data' => $this->formatOrder($order)]);
            } catch (\Exception $e) {
                report($e);

                return response()->json(['error' => $e->getMessage()], 422);
            }
        }

        return Inertia::render('admin/woocommerce/orders/show', ['orderId' => $id]);
    }

    public function customers(Request $request): Response|JsonResponse
    {
        if (!$request->wantsJson()) {
            return Inertia::render('admin/woocommerce/customers/index');
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

            if ($request->has('role')) {
                $options['role'] = $request->input('role');
            }

            $result = Customer::paginate($perPage, $page, $options);

            return response()->json($result);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function customerShow(int $id): Response|JsonResponse
    {
        if (request()->wantsJson()) {
            try {
                $customer = Customer::withOriginal()->find($id);

                return response()->json(['data' => $customer]);
            } catch (\Exception $e) {
                report($e);

                return response()->json(['error' => $e->getMessage()], 422);
            }
        }

        return Inertia::render('admin/woocommerce/customers/show', ['customerId' => $id]);
    }

    private function formatOrder($order): array
    {
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
            'billing' => $order['billing'] ?? [],
            'shipping' => $order['shipping'] ?? [],
            'line_items' => collect($order['line_items'] ?? [])->map(fn ($item) => [
                'id' => $item['id'] ?? 0,
                'name' => $item['name'] ?? '',
                'product_id' => $item['product_id'] ?? 0,
                'variation_id' => $item['variation_id'] ?? 0,
                'quantity' => $item['quantity'] ?? 0,
                'price' => (float) ($item['price'] ?? 0),
                'subtotal' => $item['subtotal'] ?? '0.00',
                'total' => $item['total'] ?? '0.00',
                'sku' => $item['sku'] ?? '',
            ])->values()->toArray(),
            'shipping_lines' => collect($order['shipping_lines'] ?? [])->map(fn ($s) => [
                'id' => $s['id'] ?? 0,
                'method_title' => $s['method_title'] ?? '',
                'method_id' => $s['method_id'] ?? '',
                'total' => $s['total'] ?? '0.00',
            ])->values()->toArray(),
            'coupon_lines' => collect($order['coupon_lines'] ?? [])->map(fn ($c) => [
                'id' => $c['id'] ?? 0,
                'code' => $c['code'] ?? '',
                'discount' => $c['discount'] ?? '0.00',
            ])->values()->toArray(),
            'customer_note' => $order['customer_note'] ?? '',
            'note' => $order['note'] ?? '',
        ];
    }
}
