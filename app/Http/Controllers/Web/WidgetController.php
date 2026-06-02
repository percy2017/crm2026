<?php

namespace App\Http\Controllers\Web;

use App\Events\WebMessageCreated;
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

        if (! $host) {
            return response()->json(['error' => 'Widget not configured for this domain'], 404);
        }

        $widget = WebWidget::where('is_active', true)
            ->where(function ($query) use ($host) {
                $query->where('domain', $host)
                    ->orWhere('domain', 'http://'.$host)
                    ->orWhere('domain', 'https://'.$host);
            })
            ->first();

        if (! $widget) {
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

        if (! $conversation) {
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
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:5000',
        ]);

        $visitor = WebVisitor::find($data['visitor_id']);
        $visitor->update(array_filter([
            'name' => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
        ], fn ($v) => $v !== null));

        $conversation = WebConversation::create([
            'visitor_id' => $data['visitor_id'],
            'widget_id' => $data['widget_id'],
            'status' => 'pending',
        ]);

        if (! empty($data['message'])) {
            $message = WebMessage::create([
                'conversation_id' => $conversation->id,
                'content' => $data['message'],
                'is_from_visitor' => true,
            ]);

            $visitor->refresh();
            $widget = WebWidget::find($data['widget_id']);

            broadcast(new WebMessageCreated(
                $conversation->id,
                $visitor->id,
                $visitor->name ?? 'Anonymous',
                $widget->id,
                $widget->name,
                [
                    'id' => $message->id,
                    'content' => $message->content,
                    'is_from_visitor' => true,
                    'created_at' => $message->created_at->toIso8601String(),
                ],
            ))->toOthers();
        }

        return response()->json([
            'conversation' => ['id' => $conversation->id],
            'visitor' => [
                'id' => $visitor->id,
                'name' => $visitor->name,
                'email' => $visitor->email,
                'phone' => $visitor->phone,
            ],
        ], 201);
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visitor_id' => 'required|exists:web_visitors,id',
            'conversation_id' => 'required|exists:web_conversations,id',
            'content' => 'required|string|max:5000',
        ]);

        $conversation = WebConversation::find($data['conversation_id']);

        if ((string) $conversation->visitor_id !== (string) $data['visitor_id']) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message = WebMessage::create([
            'conversation_id' => $data['conversation_id'],
            'content' => $data['content'],
            'is_from_visitor' => true,
        ]);

        $conversation->increment('unread_count');

        if ($conversation->status === 'closed') {
            $conversation->update(['status' => 'pending']);
        }

        $visitor = $conversation->visitor;
        $widget = $conversation->widget;

        broadcast(new WebMessageCreated(
            $conversation->id,
            $visitor->id,
            $visitor->name ?? 'Anonymous',
            $widget->id,
            $widget->name,
            [
                'id' => $message->id,
                'content' => $message->content,
                'is_from_visitor' => true,
                'created_at' => $message->created_at->toIso8601String(),
            ],
        ))->toOthers();

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
