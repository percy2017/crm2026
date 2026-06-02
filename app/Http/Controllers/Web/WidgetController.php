<?php

namespace App\Http\Controllers\Web;

use App\Events\MessageCreated;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Inbox;
use App\Models\Message;
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

        $inbox = Inbox::where('type', 'web')
            ->where('status', 'active')
            ->get()
            ->first(fn ($inbox) => $inbox->getConfigValue('domain') === $host
                || $inbox->getConfigValue('domain') === 'http://'.$host
                || $inbox->getConfigValue('domain') === 'https://'.$host);

        if (! $inbox) {
            return response()->json(['error' => 'Widget not configured for this domain'], 404);
        }

        return response()->json([
            'widget_id' => $inbox->id,
            'color' => $inbox->getConfigValue('color', '#3b82f6'),
            'position' => $inbox->getConfigValue('position', 'right'),
            'greeting' => $inbox->getConfigValue('greeting', 'Hola, ¿en qué podemos ayudarte?'),
        ]);
    }

    public function visitor(Request $request): JsonResponse
    {
        $uuid = $request->input('uuid') ?? (string) Str::uuid();

        $visitor = Contact::updateOrCreate(
            ['uuid' => $uuid],
            [
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'type' => 'web_visitor',
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'current_page' => $request->input('current_page'),
                'last_seen_at' => now(),
                'first_seen_at' => Contact::where('uuid', $uuid)->exists() ? null : now(),
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
        $request->validate(['visitor_id' => 'required|exists:contacts,id']);

        $conversation = Conversation::where('contact_id', $request->visitor_id)
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
                    'content' => $m->text,
                    'is_from_visitor' => $m->input_output,
                    'created_at' => $m->created_at,
                ]),
            ],
        ]);
    }

    public function createConversation(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visitor_id' => 'required|exists:contacts,id',
            'widget_id' => 'required|exists:inboxes,id',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:5000',
        ]);

        $visitor = Contact::find($data['visitor_id']);
        $visitor->update(array_filter([
            'name' => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
        ], fn ($v) => $v !== null));

        $inbox = Inbox::find($data['widget_id']);
        $channelId = (string) Str::uuid();

        $conversation = Conversation::create([
            'inbox_id' => $data['widget_id'],
            'channel_id' => $channelId,
            'contact_id' => $data['visitor_id'],
            'instance' => $inbox->name,
            'status' => 'pending',
        ]);

        if (! empty($data['message'])) {
            $message = Message::create([
                'channel_id' => $channelId,
                'instance' => $inbox->name,
                'input_output' => true,
                'text' => $data['message'],
            ]);

            broadcast(new MessageCreated(
                $inbox->name,
                $channelId,
                [
                    'id' => $message->id,
                    'channel_id' => $message->channel_id,
                    'input_output' => $message->input_output,
                    'message_type' => $message->message_type,
                    'text' => $message->text,
                    'media_url' => null,
                    'created_at' => $message->created_at,
                    'sender_phone' => null,
                    'sender_name' => $visitor->name,
                    'sender_avatar' => null,
                ],
                [
                    'name' => $visitor->name,
                    'phone' => $visitor->phone ?? $visitor->uuid,
                    'profile_pic_url' => null,
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
            'visitor_id' => 'required|exists:contacts,id',
            'conversation_id' => 'required|exists:conversations,id',
            'content' => 'required|string|max:5000',
        ]);

        $conversation = Conversation::find($data['conversation_id']);

        if ((string) $conversation->contact_id !== (string) $data['visitor_id']) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message = Message::create([
            'channel_id' => $conversation->channel_id,
            'instance' => $conversation->instance,
            'input_output' => true,
            'text' => $data['content'],
        ]);

        $conversation->increment('unread_count');

        if ($conversation->status === 'closed') {
            $conversation->update(['status' => 'pending']);
        }

        $visitor = $conversation->contact;

        broadcast(new MessageCreated(
            $conversation->instance,
            $conversation->channel_id,
            [
                'id' => $message->id,
                'channel_id' => $message->channel_id,
                'input_output' => $message->input_output,
                'message_type' => $message->message_type,
                'text' => $message->text,
                'media_url' => null,
                'created_at' => $message->created_at,
                'sender_phone' => null,
                'sender_name' => $visitor->name,
                'sender_avatar' => null,
            ],
            [
                'name' => $visitor->name,
                'phone' => $visitor->phone ?? $visitor->uuid,
                'profile_pic_url' => null,
            ],
        ))->toOthers();

        return response()->json([
            'message' => [
                'id' => $message->id,
                'content' => $message->text,
                'is_from_visitor' => true,
                'created_at' => $message->created_at,
            ],
        ], 201);
    }
}
