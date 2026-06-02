<?php

namespace App\Http\Controllers\Webhooks;

use App\Events\MessageCreated;
use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\EvolutionWebhook;
use App\Models\Inbox;
use App\Models\Message;
use App\Services\EvolutionApiService;
use App\Services\ImageProxyService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EvolutionWebhookController extends Controller
{
    public function handle(Request $request, ?string $instance = null)
    {
        $payload = $request->all();
        $instance = $instance ?? $payload['instance'] ?? null;

        if (! $instance || ! Inbox::where('name', $instance)->where('status', 'active')->exists()) {
            return response()->json(['status' => 'ignored', 'reason' => 'no inbox']);
        }

        EvolutionWebhook::create([
            'instance' => $instance,
            'event' => $payload['event'] ?? null,
            'payload' => $payload,
        ]);

        if (($payload['event'] ?? '') === 'messages.upsert') {
            $this->processMessage($payload, $instance);
        }

        return response()->json(['status' => 'ok']);
    }

    protected function processMessage(array $payload, string $instance): void
    {
        $data = $payload['data'] ?? [];

        if (empty($data['key']['remoteJid'])) {
            return;
        }

        $remoteJid = $data['key']['remoteJid'];
        $fromMe = $data['key']['fromMe'] ?? false;
        $pushName = $data['pushName'] ?? null;
        $messageType = $data['messageType'] ?? null;
        $messageData = $data['message'] ?? [];
        $participantJid = $data['key']['participantAlt'] ?? $data['key']['participant'] ?? null;
        $messageId = $data['key']['id'] ?? null;

        if (str_ends_with($remoteJid, '@broadcast') || str_ends_with($remoteJid, '@newsletter')) {
            return;
        }

        if ($fromMe) {
            return;
        }

        if (empty($messageData)) {
            return;
        }

        $skipTypes = ['albumMessage', 'reactionMessage', 'protocolMessage'];

        if (in_array($messageType, $skipTypes)) {
            return;
        }

        $isGroup = str_ends_with($remoteJid, '@g.us');

        $text = $this->extractText($messageData, $messageType);
        $mediaUrl = null;

        if ($this->hasMedia($messageType)) {
            try {
                $mediaUrl = $this->downloadMedia($messageData, $messageType, $messageId, $remoteJid, $instance);
            } catch (\Exception $e) {
                report($e);
            }
        }

        if ($text === null && $mediaUrl === null && ! $this->hasMedia($messageType)) {
            return;
        }

        if ($isGroup) {
            $groupPhone = str_replace('@g.us', '', $remoteJid);

            $groupContact = Contact::where('whatsapp_id', $remoteJid)->first();

            if (! $groupContact) {
                $groupName = $this->safeGroupName($remoteJid, $instance) ?? $groupPhone;

                $groupContact = Contact::create([
                    'name' => $groupName,
                    'phone' => $groupPhone,
                    'whatsapp_id' => $remoteJid,
                    'type' => 'group',
                    'is_active' => true,
                ]);
            }

            if ($participantJid) {
                $participantPhone = str_replace('@s.whatsapp.net', '', explode('@', $participantJid)[0]);
                Contact::firstOrCreate(
                    ['phone' => $participantPhone],
                    [
                        'name' => $pushName,
                        'phone' => $participantPhone,
                        'whatsapp_id' => $participantJid,
                        'type' => 'individual',
                        'is_active' => true,
                    ]
                );
            }

            $contact = $groupContact;
        } else {
            $phone = str_replace('@s.whatsapp.net', '', explode('@', $remoteJid)[0]);

            $contact = Contact::firstOrCreate(
                ['phone' => $phone],
                [
                    'name' => ! $fromMe ? $pushName : null,
                    'phone' => $phone,
                    'whatsapp_id' => $remoteJid,
                    'type' => 'individual',
                    'is_active' => true,
                ]
            );
        }

        if ($contact->wasRecentlyCreated && empty($contact->profile_pic_url)) {
            try {
                $this->fetchProfilePic($contact, $instance);
            } catch (\Exception $e) {
                report($e);
            }
        }

        $inbox = Inbox::where('name', $instance)->first();

        $conversation = Conversation::firstOrCreate(
            ['channel_id' => $remoteJid, 'instance' => $instance],
            [
                'contact_id' => $contact->id,
                'instance' => $instance,
                'inbox_id' => $inbox?->id,
            ]
        );

        if ($conversation->wasRecentlyCreated && $inbox) {
            $conversation->update(['inbox_id' => $inbox->id]);
        }

        if ($messageId) {
            $existing = Message::where('message_id', $messageId)->exists();

            if ($existing) {
                return;
            }
        }

        $senderPhone = null;

        if ($isGroup && $participantJid) {
            $senderPhone = str_replace('@s.whatsapp.net', '', explode('@', $participantJid)[0]);
        }

        try {
            $message = Message::create([
                'channel_id' => $remoteJid,
                'message_id' => $messageId,
                'input_output' => ! $fromMe,
                'message_type' => $messageType,
                'text' => $text,
                'media_url' => $mediaUrl,
                'sender_phone' => $senderPhone,
            ]);
        } catch (UniqueConstraintViolationException) {
            return;
        }

        if (! $fromMe) {
            $conversation->increment('unread_count');
        }

        broadcast(new MessageCreated(
            $instance,
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
                'sender_phone' => $message->sender_phone,
                'sender_name' => $message->sender_phone
                    ? Contact::where('phone', $message->sender_phone)->value('name')
                    : null,
                'sender_avatar' => $message->sender_phone
                    ? Contact::where('phone', $message->sender_phone)->value('profile_pic_url')
                    : null,
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

    protected function extractText(array $message, ?string $type): ?string
    {
        if ($type === 'conversation') {
            return $message['conversation'] ?? null;
        }

        $mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'extendedTextMessage'];

        foreach ($mediaTypes as $mediaType) {
            if (isset($message[$mediaType])) {
                return $message[$mediaType]['caption']
                    ?? $message[$mediaType]['text']
                    ?? null;
            }
        }

        return null;
    }

    protected function hasMedia(?string $type): bool
    {
        $mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];

        return in_array($type, $mediaTypes);
    }

    protected function downloadMedia(array $message, ?string $type, string $messageId, string $remoteJid, string $instance): ?string
    {
        $mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];

        foreach ($mediaTypes as $mediaType) {
            if (! isset($message[$mediaType])) {
                continue;
            }

            $media = $message[$mediaType];
            $mimetype = $media['mimetype'] ?? 'application/octet-stream';
            $extension = Str::afterLast($mimetype, '/');
            if (str_contains($extension, ';')) {
                $extension = Str::before($extension, ';');
            }
            $extension = $extension ?: 'bin';

            $api = app(EvolutionApiService::class);
            $result = $api->getBase64FromMediaMessage($instance, $messageId, $remoteJid);

            if (! empty($result['base64'])) {
                $filename = Str::uuid().'.'.$extension;
                Storage::disk('public')->put($filename, base64_decode($result['base64']));

                return $filename;
            }

            return null;
        }

        return null;
    }

    protected function fetchProfilePic(Contact $contact, string $instance): void
    {
        $api = app(EvolutionApiService::class);
        $number = str_replace('@s.whatsapp.net', '', $contact->whatsapp_id ?? $contact->phone);
        $result = $api->fetchProfilePictureUrl($instance, $number);

        if (! empty($result['profilePictureUrl'])) {
            $localPath = app(ImageProxyService::class)->download($result['profilePictureUrl']);
            if ($localPath) {
                $contact->update(['profile_pic_url' => $localPath]);
            }
        }
    }

    protected function fetchGroupName(string $groupJid, string $instance): ?string
    {
        try {
            $api = app(EvolutionApiService::class);
            $groups = $api->fetchGroups($instance);

            foreach ($groups as $group) {
                if (($group['id'] ?? '') === $groupJid) {
                    return $group['subject'] ?? null;
                }
            }
        } catch (\Exception $e) {
            report($e);
        }

        return null;
    }

    protected function safeGroupName(string $groupJid, string $instance): ?string
    {
        try {
            return $this->fetchGroupName($groupJid, $instance);
        } catch (\Exception $e) {
            report($e);

            return null;
        }
    }
}
