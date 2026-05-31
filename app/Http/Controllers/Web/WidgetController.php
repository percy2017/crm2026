<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\WebConversation;
use App\Models\WebMessage;
use App\Models\WebVisitor;
use App\Models\WebWidget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WidgetController extends Controller
{
    public function config(Request $request): JsonResponse
    {
        $host = parse_url($request->header('Origin', '') ?: $request->header('Referer', ''), PHP_URL_HOST);

        if (!$host) {
            return response()->json(['error' => 'Widget not configured for this domain'], 404);
        }

        $widget = WebWidget::where('is_active', true)
            ->where(function ($query) use ($host) {
                $query->where('domain', $host)
                    ->orWhere('domain', 'http://' . $host)
                    ->orWhere('domain', 'https://' . $host);
            })
            ->first();

        if (!$widget) {
            return response()->json(['error' => 'Widget not configured for this domain'], 404);
        }

        return response()->json([
            'widget_id' => $widget->id,
            'color' => $widget->color,
            'position' => $widget->position,
            'greeting' => $widget->greeting,
        ]);
    }

    public function visitor(Request $request): JsonResponse
    {
        $uuid = $request->input('uuid') ?? (string) Str::uuid();

        $visitor = WebVisitor::updateOrCreate(
            ['uuid' => $uuid],
            [
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'current_page' => $request->input('current_page'),
                'last_seen_at' => now(),
                'first_seen_at' => WebVisitor::where('uuid', $uuid)->exists()
                    ? null
                    : now(),
            ]
        );

        return response()->json([
            'visitor' => [
                'id' => $visitor->id,
                'uuid' => $visitor->uuid,
            ],
        ]);
    }

    public function conversations(Request $request): JsonResponse
    {
        $request->validate(['visitor_id' => 'required|exists:web_visitors,id']);

        $conversation = WebConversation::where('visitor_id', $request->visitor_id)
            ->whereIn('status', ['pending', 'active'])
            ->with('messages')
            ->latest()
            ->first();

        if (!$conversation) {
            return response()->json(['conversation' => null]);
        }

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'status' => $conversation->status,
                'messages' => $conversation->messages->map(fn ($m) => [
                    'id' => $m->id,
                    'content' => $m->content,
                    'is_from_visitor' => $m->is_from_visitor,
                    'created_at' => $m->created_at,
                ]),
            ],
        ]);
    }

    public function createConversation(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visitor_id' => 'required|exists:web_visitors,id',
            'widget_id' => 'required|exists:web_widgets,id',
            'message' => 'nullable|string|max:5000',
        ]);

        $conversation = WebConversation::create([
            'visitor_id' => $data['visitor_id'],
            'widget_id' => $data['widget_id'],
            'status' => 'pending',
        ]);

        if (!empty($data['message'])) {
            WebMessage::create([
                'conversation_id' => $conversation->id,
                'content' => $data['message'],
                'is_from_visitor' => true,
            ]);
        }

        return response()->json([
            'conversation' => ['id' => $conversation->id],
        ], 201);
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'conversation_id' => 'required|exists:web_conversations,id',
            'content' => 'required|string|max:5000',
        ]);

        $message = WebMessage::create([
            'conversation_id' => $data['conversation_id'],
            'content' => $data['content'],
            'is_from_visitor' => true,
        ]);

        $conversation = WebConversation::find($data['conversation_id']);
        $conversation->increment('unread_count');

        if ($conversation->status === 'closed') {
            $conversation->update(['status' => 'pending']);
        }

        return response()->json([
            'message' => [
                'id' => $message->id,
                'content' => $message->content,
                'is_from_visitor' => true,
                'created_at' => $message->created_at,
            ],
        ], 201);
    }
}
