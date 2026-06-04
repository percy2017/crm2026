<?php

namespace App\Http\Controllers\Webhooks;

use App\Events\InboxStatusUpdated;
use App\Events\MessageCreated;
use App\Events\MessageStatusUpdated;
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
        ini_set('memory_limit', '-1');

        $payload = $request->all();
        $instance = $instance ?? $payload['instance'] ?? null;

        if (! $instance) {
            return response()->json(['status' => 'ignored', 'reason' => 'no instance']);
        }

        $inbox = Inbox::where('name', $instance)->first();

        if (! $inbox) {
            return response()->json(['status' => 'ignored', 'reason' => 'no inbox']);
        }

        $event = $payload['event'] ?? '';

        if ($inbox->status !== 'active' && $event !== 'CONNECTION_UPDATE') {
            return response()->json(['status' => 'ignored', 'reason' => 'inactive inbox']);
        }

        if (($payload['instance'] ?? null) && $payload['instance'] !== $instance) {
            return response()->json(['status' => 'ignored', 'reason' => 'payload instance mismatch']);
        }

        EvolutionWebhook::create([
            'instance' => $instance,
            'event' => $event,
            'payload' => $payload,
        ]);

        if (in_array($event, ['messages.upsert', 'send.message', 'messages.update'])) {
            if ($event === 'messages.upsert') {
                $this->processMessage($payload, $instance);
            } else {
                $this->processAck($payload, $instance);
            }
        } else {
            $this->handleSystemEvent($payload, $instance);
        }

        return response()->json(['status' => 'ok']);
    }

    protected function handleSystemEvent(array $payload, string $instance): void
    {
        $event = $payload['event'] ?? '';

        match ($event) {
            'CONNECTION_UPDATE' => $this->handleConnectionUpdate($payload, $instance),
            'QRCODE_UPDATED' => $this->handleQrCodeUpdate($instance),
            'LOGOUT_INSTANCE', 'REMOVE_INSTANCE' => $this->handleInstanceRemoved($instance),
            'APPLICATION_STARTUP' => $this->handleAppStartup($instance),
            'CALL' => $this->handleCallEvent($payload, $instance),
            default => null,
        };
    }

    protected function handleConnectionUpdate(array $payload, string $instance): void
    {
        $status = $payload['data']['instance']['connectionStatus'] ?? null;

        if ($status) {
            $inboxStatus = 'active';
            if ($status !== 'open') {
                $inboxStatus = 'inactive';
            }

            Inbox::where('name', $instance)->update([
                'config->connectionStatus' => $status,
                'status' => $inboxStatus,
            ]);

            try {
                broadcast(new InboxStatusUpdated(
                    $instance,
                    $status,
                    $inboxStatus,
                ));
            } catch (\Exception) {
                // broadcast rate-limited
            }
        }
    }

    protected function handleQrCodeUpdate(string $instance): void
    {
        Inbox::where('name', $instance)->update([
            'config->connectionStatus' => 'disconnected',
            'status' => 'inactive',
        ]);

        try {
            broadcast(new InboxStatusUpdated(
                $instance,
                'disconnected',
                'inactive',
            ));
        } catch (\Exception) {
            // broadcast rate-limited
        }
    }

    protected function handleInstanceRemoved(string $instance): void
    {
        Inbox::where('name', $instance)->update([
            'config->connectionStatus' => 'removed',
            'status' => 'inactive',
        ]);

        try {
            broadcast(new InboxStatusUpdated(
                $instance,
                'removed',
                'inactive',
            ));
        } catch (\Exception) {
            // broadcast rate-limited
        }
    }

    protected function handleAppStartup(string $instance): void
    {
        Inbox::where('name', $instance)->update([
            'config->connectionStatus' => 'connecting',
        ]);

        try {
            broadcast(new InboxStatusUpdated(
                $instance,
                'connecting',
                'active',
            ));
        } catch (\Exception) {
            // broadcast rate-limited
        }
    }

    protected function handleCallEvent(array $payload, string $instance): void
    {
        $data = $payload['data'] ?? [];
        $callStatus = $data['status'] ?? null;
        $callType = $data['type'] ?? 'voice';
        $from = $data['from'] ?? null;
        $to = $data['to'] ?? null;
        $duration = $data['duration'] ?? null;
        $callId = $data['callId'] ?? null;

        if (! $from && ! $to) {
            return;
        }

        $remoteJid = $from ?? $to;

        if (str_ends_with($remoteJid, '@broadcast') || str_ends_with($remoteJid, '@newsletter')) {
            return;
        }

        $phone = str_replace('@s.whatsapp.net', '', explode('@', $remoteJid)[0]);

        $contact = Contact::firstOrCreate(
            ['phone' => $phone],
            [
                'name' => null,
                'phone' => $phone,
                'whatsapp_id' => $remoteJid,
                'type' => 'individual',
                'is_active' => true,
            ]
        );

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

        $icon = $callType === 'video' ? '📹' : '📞';
        $statusLabel = match ($callStatus) {
            'offer' => 'entrante',
            'ringing' => 'sonando',
            'accept' => 'respondida',
            'reject' => 'rechazada',
            'timeout' => 'no respondida',
            'ended' => 'finalizada',
            default => $callStatus,
        };
        $durationText = $duration ? ' — '.gmdate('i:s', (int) $duration).' min' : '';

        $text = "{$icon} Llamada de {$callType} {$statusLabel}{$durationText}";

        try {
            Message::create([
                'channel_id' => $remoteJid,
                'instance' => $instance,
                'message_id' => $callId,
                'input_output' => false,
                'message_type' => 'callLog',
                'text' => $text,
                'sender_phone' => null,
            ]);
        } catch (UniqueConstraintViolationException) {
            return;
        }

        try {
            broadcast(new MessageCreated(
                $instance,
                $remoteJid,
                [
                    'id' => 0,
                    'channel_id' => $remoteJid,
                    'input_output' => false,
                    'message_type' => 'callLog',
                    'text' => $text,
                    'media_url' => null,
                    'created_at' => now()->toISOString(),
                    'sender_phone' => null,
                    'sender_name' => null,
                    'sender_avatar' => null,
                    'contact_id' => $contact->id,
                    'contact_name' => $contact->name,
                    'contact_phone' => $contact->phone,
                    'contact_avatar' => $contact->profile_pic_url
                        ? (str_starts_with($contact->profile_pic_url, 'http')
                            ? $contact->profile_pic_url
                            : asset('storage/'.$contact->profile_pic_url))
                        : null,
                    'inbox_id' => $inbox?->id,
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
        } catch (\Exception) {
            // broadcast rate-limited, message saved
        }
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

        if ($messageId) {
            $existing = Message::where('message_id', $messageId)
                ->whereIn('channel_id', function ($q) use ($instance) {
                    $q->select('channel_id')
                        ->from('conversations')
                        ->where('instance', $instance);
                })
                ->exists();

            if ($existing) {
                return;
            }
        }

        if (empty($messageData)) {
            return;
        }

        $skipTypes = ['albumMessage', 'protocolMessage'];

        if (in_array($messageType, $skipTypes)) {
            return;
        }

        $isGroup = str_ends_with($remoteJid, '@g.us');

        $text = $this->extractText($messageData, $messageType);
        $mediaUrl = null;
        $reactionTo = null;
        $isReaction = $messageType === 'reactionMessage';

        if ($isReaction) {
            $reactionTo = $messageData['reactionMessage']['key']['id'] ?? null;
        }

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

        if ($messageType === 'contactMessage') {
            $vcard = $messageData['contactMessage']['vcard'] ?? '';
            preg_match('/waid=(\d+)/', $vcard, $matches);
            $sharedPhone = $matches[1] ?? null;
            $sharedName = $messageData['contactMessage']['displayName'] ?? null;

            if ($sharedPhone) {
                $sharedContact = Contact::firstOrCreate(
                    ['phone' => $sharedPhone],
                    [
                        'name' => $sharedName,
                        'phone' => $sharedPhone,
                        'whatsapp_id' => $sharedPhone.'@s.whatsapp.net',
                        'type' => 'individual',
                        'is_active' => true,
                    ]
                );

                if ($sharedContact->wasRecentlyCreated && empty($sharedContact->profile_pic_url)) {
                    try {
                        $this->fetchProfilePic($sharedContact, $instance);
                    } catch (\Exception $e) {
                        report($e);
                    }
                }

                $text = $sharedPhone
                    ? "📇 {$sharedName}\n{$sharedPhone}"
                    : "📇 {$sharedName}";
            }
        }

        if ($isGroup) {
            $groupPhone = str_replace('@g.us', '', $remoteJid);

            $groupContact = Contact::where('whatsapp_id', $remoteJid)->first();

            if (! $groupContact) {
                $groupName = $this->safeGroupName($remoteJid, $instance) ?? $groupPhone;

                try {
                    $groupContact = Contact::create([
                        'name' => $groupName,
                        'phone' => $groupPhone,
                        'whatsapp_id' => $remoteJid,
                        'type' => 'group',
                        'is_active' => true,
                    ]);
                } catch (UniqueConstraintViolationException) {
                    $groupContact = Contact::where('whatsapp_id', $remoteJid)->first();
                }
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

        $senderPhone = null;

        if ($isGroup && $participantJid) {
            $senderPhone = str_replace('@s.whatsapp.net', '', explode('@', $participantJid)[0]);
        }

        try {
            $messageData = [
                'channel_id' => $remoteJid,
                'instance' => $instance,
                'message_id' => $messageId,
                'reaction_to' => $reactionTo,
                'input_output' => ! $fromMe,
                'message_type' => $messageType,
                'text' => $text,
                'media_url' => $mediaUrl,
                'sender_phone' => $senderPhone,
            ];

            if ($fromMe) {
                $messageData['status'] = 'sent';
            }

            $message = Message::create($messageData);
        } catch (UniqueConstraintViolationException) {
            return;
        }

        if (! $fromMe) {
            $conversation->increment('unread_count');
        }

        try {
            broadcast(new MessageCreated(
                $instance,
                $remoteJid,
                [
                    'id' => $message->id,
                    'channel_id' => $message->channel_id,
                    'message_id' => $message->message_id,
                    'input_output' => $message->input_output,
                    'message_type' => $message->message_type,
                    'text' => $message->text ? (strlen($message->text) > 500 ? substr($message->text, 0, 500).'…' : $message->text) : null,
                    'media_url' => $message->media_url
                        ? asset('storage/'.$message->media_url)
                        : null,
                    'created_at' => $message->created_at,
                    'sender_phone' => $message->sender_phone,
                    'reaction_to' => $message->reaction_to,
                    'status' => $message->status,
                    'sender_name' => $message->sender_phone
                        ? Contact::where('phone', $message->sender_phone)->value('name')
                        : null,
                    'sender_avatar' => $message->sender_phone
                        ? Contact::where('phone', $message->sender_phone)->value('profile_pic_url')
                        : null,
                    'contact_id' => $contact->id,
                    'contact_name' => $contact->name,
                    'contact_phone' => $contact->phone,
                    'contact_avatar' => $contact->profile_pic_url
                        ? (str_starts_with($contact->profile_pic_url, 'http')
                            ? $contact->profile_pic_url
                            : asset('storage/'.$contact->profile_pic_url))
                        : null,
                    'inbox_id' => $inbox?->id,
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
        } catch (\Exception) {
            // broadcast rate-limited, message saved
        }
    }

    protected function processAck(array $payload, string $instance): void
    {
        $data = $payload['data'] ?? [];
        $key = $data['key'] ?? [];

        // send.message: key.id, messages.update: keyId
        $messageId = $key['id'] ?? $data['keyId'] ?? null;
        $remoteJid = $key['remoteJid'] ?? $data['remoteJid'] ?? null;
        $statusRaw = $data['status'] ?? null;
        $fromMe = $key['fromMe'] ?? $data['fromMe'] ?? false;

        if (! $messageId || ! $remoteJid || ! $fromMe || ! $statusRaw) {
            return;
        }

        $mapped = match (strtoupper($statusRaw)) {
            'SERVER_ACK' => 'sent',
            'DELIVERY_ACK' => 'delivered',
            'READ' => 'read',
            'ERROR' => 'failed',
            default => null,
        };

        if (! $mapped) {
            return;
        }

        $message = Message::where('message_id', $messageId)
            ->where('instance', $instance)
            ->where('input_output', false)
            ->first();

        if (! $message) {
            return;
        }

        $message->update(['status' => $mapped]);

        try {
            broadcast(new MessageStatusUpdated(
                $instance,
                $remoteJid,
                $messageId,
                $mapped,
                $message->id,
            ));
        } catch (\Exception) {
            // broadcast rate-limited, status saved in DB
        }
    }

    protected function extractText(array $message, ?string $type): ?string
    {
        if ($type === 'conversation') {
            return $message['conversation'] ?? null;
        }

        $mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'extendedTextMessage', 'reactionMessage', 'contactMessage', 'locationMessage', 'productMessage'];

        foreach ($mediaTypes as $mediaType) {
            if (isset($message[$mediaType])) {
                if ($mediaType === 'reactionMessage') {
                    return $message[$mediaType]['text'] ?? null;
                }

                if ($mediaType === 'contactMessage') {
                    return $message[$mediaType]['displayName'] ?? 'Contacto compartido';
                }

                if ($mediaType === 'locationMessage') {
                    $lat = $message[$mediaType]['degreesLatitude'] ?? null;
                    $lng = $message[$mediaType]['degreesLongitude'] ?? null;
                    $name = $message[$mediaType]['name'] ?? null;
                    $address = $message[$mediaType]['address'] ?? null;
                    $parts = ['📍'];

                    if ($name) {
                        $parts[] = $name;
                    }

                    if ($address) {
                        $parts[] = $address;
                    }

                    if ($lat !== null && $lng !== null) {
                        $parts[] = "https://maps.google.com/?q={$lat},{$lng}";
                    }

                    return implode("\n", $parts);
                }

                if ($mediaType === 'productMessage') {
                    $product = $message[$mediaType]['product'] ?? [];
                    $title = $product['title'] ?? null;
                    $priceLow = $product['priceAmount1000']['low'] ?? null;
                    $currency = $product['currencyCode'] ?? null;
                    $parts = ['🛍️'];

                    if ($title) {
                        $parts[] = $title;
                    }

                    if ($priceLow !== null) {
                        $priceFormatted = number_format($priceLow / 1000, $currency === 'BOB' ? 0 : 2);
                        $parts[] = "{$priceFormatted} {$currency}";
                    }

                    return implode("\n", $parts);
                }

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
