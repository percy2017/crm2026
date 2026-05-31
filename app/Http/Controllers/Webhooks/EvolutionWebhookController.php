<?php

namespace App\Http\Controllers\Webhooks;

use App\Events\MessageCreated;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\EvolutionWebhook;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EvolutionWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->all();

        EvolutionWebhook::create([
            'instance' => $payload['instance'] ?? null,
            'event' => $payload['event'] ?? null,
            'payload' => $payload,
        ]);

        if (($payload['event'] ?? '') !== 'messages.upsert') {
            return response()->json(['status' => 'ok']);
        }

        $data = $payload['data'] ?? [];

        if (empty($data['key']['remoteJid'])) {
            return response()->json(['status' => 'ok']);
        }

        $remoteJid = $data['key']['remoteJid'];
        $fromMe = $data['key']['fromMe'] ?? false;
        $pushName = $data['pushName'] ?? null;
        $messageType = $data['messageType'] ?? null;
        $messageData = $data['message'] ?? [];

        if (str_ends_with($remoteJid, '@broadcast')) {
            return response()->json(['status' => 'ok']);
        }

        if (empty($messageData)) {
            return response()->json(['status' => 'ok']);
        }

        $phone = str_replace('@s.whatsapp.net', '', explode('@', $remoteJid)[0]);

        $text = $this->extractText($messageData, $messageType);

        $mediaUrl = $this->downloadMedia($messageData, $messageType);

        $contact = Contact::updateOrCreate(
            ['phone' => $phone],
            [
                'name' => $pushName,
                'phone' => $phone,
                'whatsapp_id' => $remoteJid,
                'type' => 'individual',
                'is_active' => true,
            ]
        );

        Conversation::firstOrCreate(
            ['channel_id' => $remoteJid],
            [
                'contact_id' => $contact->id,
                'instance' => $payload['instance'] ?? null,
            ]
        );

        $message = Message::create([
            'channel_id' => $remoteJid,
            'input_output' => ! $fromMe,
            'message_type' => $messageType,
            'text' => $text,
            'media_url' => $mediaUrl,
        ]);

        if ($fromMe === false || $fromMe === 0) {
            broadcast(new MessageCreated(
                $payload['instance'] ?? $message->channel_id,
                $remoteJid,
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
                ],
                [
                    'name' => $contact->name,
                    'phone' => $contact->phone,
                    'profile_pic_url' => $contact->profile_pic_url
                        ? (str_starts_with($contact->profile_pic_url, 'http')
                            ? $contact->profile_pic_url
                            : asset('storage/'.$contact->profile_pic_url))
                        : null,
                ],
            ));
        }

        return response()->json(['status' => 'ok']);
    }

    private function extractText(array $message, ?string $type): ?string
    {
        if ($type === 'conversation') {
            return $message['conversation'] ?? null;
        }

        $mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage', 'extendedTextMessage'];

        foreach ($mediaTypes as $mediaType) {
            if (isset($message[$mediaType])) {
                return $message[$mediaType]['caption']
                    ?? $message[$mediaType]['text']
                    ?? null;
            }
        }

        return null;
    }

    private function downloadMedia(array $message, ?string $type): ?string
    {
        $mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];

        foreach ($mediaTypes as $mediaType) {
            if (! isset($message[$mediaType]['url'])) {
                continue;
            }

            $media = $message[$mediaType];
            $url = $media['url'];
            $mimetype = $media['mimetype'] ?? 'application/octet-stream';

            $extension = Str::afterLast($mimetype, '/');
            if (str_contains($extension, ';')) {
                $extension = Str::before($extension, ';');
            }
            $extension = $extension ?: 'bin';

            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept' => '*/*',
            ])->timeout(30)->get($url);

            if ($response->failed()) {
                return null;
            }

            $filename = Str::uuid().'.'.$extension;
            Storage::disk('public')->put($filename, $response->body());

            return $filename;
        }

        return null;
    }
}
