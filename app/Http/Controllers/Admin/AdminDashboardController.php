<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Inbox;
use App\Models\Message;
use Codexshaper\WooCommerce\Facades\Order;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard');
    }

    public function data(): JsonResponse
    {
        $today = today();

        $messagesToday = Message::whereDate('created_at', $today)->count();
        $messagesSent = Message::whereDate('created_at', $today)->where('input_output', false)->count();
        $messagesReceived = Message::whereDate('created_at', $today)->where('input_output', true)->count();
        $activeConversations = Conversation::where('status', 'active')->count();
        $totalContacts = Contact::count();
        $newContacts = Contact::whereDate('created_at', $today)->count();
        $activeInboxes = Inbox::where('status', 'active')->count();

        $recentConversations = Conversation::with('contact')
            ->whereHas('contact')
            ->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(fn ($conv) => [
                'id' => $conv->id,
                'contact_name' => $conv->contact?->name ?? $conv->channel_id,
                'contact_phone' => $conv->contact?->phone,
                'last_message_at' => $conv->updated_at?->toISOString(),
            ]);

        $inboxes = Inbox::where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(fn ($inbox) => [
                'name' => $inbox->name,
                'type' => $inbox->type,
                'connection_status' => $inbox->getConfigValue('connectionStatus', 'unknown'),
            ]);

        $wooOrdersToday = 0;
        $wooSalesToday = '0.00';
        $wooRecentOrders = [];

        try {
            $orders = Order::all(['per_page' => 20, 'orderby' => 'date', 'order' => 'desc']);
            $ordersArr = collect($orders)->map(fn ($o) => (array) $o);

            $wooOrdersToday = $ordersArr->filter(fn ($o) => str_starts_with($o['date_created'] ?? '', $today->toDateString()))->count();
            $wooSalesToday = $ordersArr->filter(fn ($o) => str_starts_with($o['date_created'] ?? '', $today->toDateString()))->sum('total');

            $wooRecentOrders = $ordersArr->take(5)->map(fn ($o) => [
                'id' => $o['id'] ?? 0,
                'number' => $o['number'] ?? '',
                'total' => $o['total'] ?? '0.00',
                'status' => $o['status'] ?? '',
                'date_created' => $o['date_created'] ?? '',
            ])->values()->toArray();
        } catch (\Exception $e) {
            report($e);
        }

        return response()->json([
            'messages_today' => $messagesToday,
            'messages_sent_today' => $messagesSent,
            'messages_received_today' => $messagesReceived,
            'active_conversations' => $activeConversations,
            'total_contacts' => $totalContacts,
            'new_contacts_today' => $newContacts,
            'active_inboxes' => $activeInboxes,
            'recent_conversations' => $recentConversations,
            'inboxes' => $inboxes,
            'woo_orders_today' => $wooOrdersToday,
            'woo_sales_today' => $wooSalesToday,
            'woo_recent_orders' => $wooRecentOrders,
        ]);
    }
}
