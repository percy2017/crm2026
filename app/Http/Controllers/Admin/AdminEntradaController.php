<?php

namespace App\Http\Controllers\Admin;

use App\Events\MessageCreated;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\EvolutionApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminEntradaController extends Controller
{
    public function chat(string $instance, EvolutionApiService $evolution): Response
    {
        return Inertia::render('admin/entradas/chat', [
            'instance' => $instance,
        ]);
    }

    public function chats(string $instance): JsonResponse
    {
        $conversations = Conversation::where('instance', $instance)
            ->with('contact')
            ->get()
            ->map(fn (Conversation $conv) => [
                'id' => $conv->id,
                'contact_id' => $conv->contact_id,
                'channel_id' => $conv->channel_id,
                'unread_count' => $conv->unread_count,
                'contact' => [
                    'name' => $conv->contact->name,
                    'phone' => $conv->contact->phone,
                    'profile_pic_url' => $conv->contact->profile_pic_url
                        ? (str_starts_with($conv->contact->profile_pic_url, 'http')
                            ? $conv->contact->profile_pic_url
                            : asset('storage/'.$conv->contact->profile_pic_url))
                        : null,
                ],
                'last_message' => Message::where('channel_id', $conv->channel_id)
                    ->latest('created_at')
                    ->first(['text', 'created_at']),
            ]);

        $sorted = $conversations->sortByDesc(fn ($c) => $c['last_message']?->created_at);

        return response()->json($sorted->values());
    }

    public function messages(Request $request, string $instance): JsonResponse
    {
        $request->validate([
            'channel_id' => 'required|string',
        ]);

        Conversation::where('channel_id', $request->input('channel_id'))
            ->where('instance', $instance)
            ->update(['unread_count' => 0]);

        $messages = Message::where('channel_id', $request->input('channel_id'))
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function (Message $msg) {
                $sender = $msg->sender_phone ? Contact::where('phone', $msg->sender_phone)->first() : null;

                return [
                    'id' => $msg->id,
                    'channel_id' => $msg->channel_id,
                    'input_output' => $msg->input_output,
                    'message_type' => $msg->message_type,
                    'text' => $msg->text,
                    'media_url' => $msg->media_url
                        ? asset('storage/'.$msg->media_url)
                        : null,
                    'created_at' => $msg->created_at,
                    'sender_phone' => $msg->sender_phone,
                    'sender_name' => $sender?->name,
                    'sender_avatar' => $sender?->profile_pic_url
                        ? (str_starts_with($sender->profile_pic_url, 'http')
                            ? $sender->profile_pic_url
                            : asset('storage/'.$sender->profile_pic_url))
                        : null,
                ];
            });

        return response()->json($messages);
    }

    public function send(Request $request, string $instance, EvolutionApiService $evolution): JsonResponse
    {
        $request->validate([
            'number' => 'required|string',
            'text' => 'nullable|string|max:4096',
            'channel_id' => 'nullable|string',
            'media_url' => 'nullable|string',
            'media_type' => 'nullable|string',
            'media_mimetype' => 'nullable|string',
            'file_name' => 'nullable|string',
        ]);

        try {
            $number = $request->input('number');
            $channelId = $request->input('channel_id')
                ?? $number.'@s.whatsapp.net';

            $mediaUrl = $request->input('media_url');

            if ($mediaUrl) {
                $publicUrl = asset('storage/'.$mediaUrl);

                $result = $evolution->sendMedia(
                    $instance,
                    $number,
                    $request->input('media_type', 'document'),
                    $publicUrl,
                    $request->input('media_mimetype', 'application/octet-stream'),
                    $request->input('text'),
                    $request->input('file_name')
                );

                $messageType = $request->input('media_type') === 'audio' ? 'audioMessage' : ($request->input('media_type') === 'image' ? 'imageMessage' : 'documentMessage');

                $message = Message::create([
                    'channel_id' => $channelId,
                    'input_output' => false,
                    'message_type' => $messageType,
                    'text' => $request->input('text'),
                    'media_url' => $mediaUrl,
                ]);

                $keyId = $result['key']['id'] ?? null;
                if ($keyId) {
                    $message->update(['message_id' => $keyId]);
                }
            } else {
                $result = $evolution->sendText(
                    $instance,
                    $number,
                    $request->input('text')
                );

                $message = Message::create([
                    'channel_id' => $channelId,
                    'input_output' => false,
                    'message_type' => 'extendedTextMessage',
                    'text' => $request->input('text'),
                ]);

                $keyId = $result['key']['id'] ?? null;
                if ($keyId) {
                    $message->update(['message_id' => $keyId]);
                }
            }

            $contact = Contact::where('phone', $number)->first();

            broadcast(new MessageCreated(
                $instance,
                $channelId,
                [
                    'id' => $message->id,
                    'channel_id' => $message->channel_id,
                    'input_output' => $message->input_output,
                    'message_type' => $message->message_type,
                    'text' => $message->text,
                    'media_url' => $message->media_url
                        ? asset('storage/'.$message->media_url)
                        : null,
                    'created_at' => $message->created_at,
                    'sender_phone' => null,
                    'sender_name' => null,
                    'sender_avatar' => null,
                ],
                [
                    'name' => $contact?->name,
                    'phone' => $contact?->phone ?? $number,
                    'profile_pic_url' => $contact?->profile_pic_url
                        ? (str_starts_with($contact->profile_pic_url, 'http')
                            ? $contact->profile_pic_url
                            : asset('storage/'.$contact->profile_pic_url))
                        : null,
                ],
            ));

            return response()->json([
                'evolution' => $result,
                'message' => [
                    'id' => $message->id,
                    'channel_id' => $message->channel_id,
                    'input_output' => $message->input_output,
                    'message_type' => $message->message_type,
                    'text' => $message->text,
                    'media_url' => $message->media_url
                        ? asset('storage/'.$message->media_url)
                        : null,
                    'created_at' => $message->created_at,
                ],
            ]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function destroyConversation(string $instance, Conversation $conversation): JsonResponse
    {
        if ($conversation->instance !== $instance) {
            return response()->json(['error' => 'Conversation not found'], 404);
        }

        $conversation->messages()->delete();
        $conversation->delete();

        return response()->json(['deleted' => true]);
    }
}
