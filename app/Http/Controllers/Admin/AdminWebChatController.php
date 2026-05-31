<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WebConversation;
use App\Models\WebMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminWebChatController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/web-chat/index');
    }

    public function conversations(): JsonResponse
    {
        $conversations = WebConversation::with(['visitor', 'widget', 'assignedUser'])
            ->orderByRaw("CASE status WHEN 'pending' THEN 1 WHEN 'active' THEN 2 WHEN 'closed' THEN 3 END")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'status' => $c->status,
                'unread_count' => $c->unread_count,
                'visitor' => [
                    'id' => $c->visitor->id,
                    'name' => $c->visitor->name ?? 'Anonymous',
                    'current_page' => $c->visitor->current_page,
                    'last_seen_at' => $c->visitor->last_seen_at,
                ],
                'widget' => ['name' => $c->widget->name],
                'assigned_user' => $c->assignedUser
                    ? ['id' => $c->assignedUser->id, 'name' => $c->assignedUser->name]
                    : null,
                'created_at' => $c->created_at,
                'last_message' => $c->messages()->latest()->first()?->content,
                'last_message_at' => $c->messages()->latest()->first()?->created_at,
            ]);

        return response()->json(['conversations' => $conversations]);
    }

    public function messages(WebConversation $webConversation): JsonResponse
    {
        $messages = $webConversation->messages()
            ->orderBy('created_at')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'content' => $m->content,
                'is_from_visitor' => $m->is_from_visitor,
                'created_at' => $m->created_at,
            ]);

        $webConversation->update(['unread_count' => 0]);

        return response()->json(['messages' => $messages]);
    }

    public function send(Request $request, WebConversation $webConversation): JsonResponse
    {
        $data = $request->validate(['content' => 'required|string|max:5000']);

        $message = WebMessage::create([
            'conversation_id' => $webConversation->id,
            'content' => $data['content'],
            'is_from_visitor' => false,
        ]);

        if ($webConversation->status === 'pending') {
            $webConversation->update(['status' => 'active']);
        }

        return response()->json([
            'message' => [
                'id' => $message->id,
                'content' => $message->content,
                'is_from_visitor' => false,
                'created_at' => $message->created_at,
            ],
        ], 201);
    }

    public function assign(Request $request, WebConversation $webConversation): JsonResponse
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $webConversation->update([
            'assigned_to' => $request->user_id,
            'status' => 'active',
        ]);

        return response()->json(['message' => 'Conversation assigned.']);
    }

    public function close(WebConversation $webConversation): JsonResponse
    {
        $webConversation->update(['status' => 'closed']);

        return response()->json(['message' => 'Conversation closed.']);
    }
}
