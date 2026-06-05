<?php

namespace App\Services;

use App\Models\Inbox;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class EvolutionApiService
{
    private string $serverUrl;

    private string $apiKey;

    public function __construct()
    {
        $this->serverUrl = rtrim(config('evolution.server_url', ''), '/');

        $this->apiKey = config('evolution.api_key', '');

        if (empty($this->serverUrl) || empty($this->apiKey)) {
            throw new RuntimeException('Evolution API credentials not configured.');
        }
    }

    public function forInbox(Inbox $inbox): static
    {
        $url = $inbox->getConfigValue('serverUrl');
        $key = $inbox->getConfigValue('apikey');

        if ($key) {
            $service = clone $this;
            $service->apiKey = $key;
            $service->serverUrl = $url ? rtrim($url, '/') : $this->serverUrl;

            return $service;
        }

        return $this;
    }

    public function fetchInstances(): array
    {
        $response = $this->client()->get('/instance/fetchInstances');

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function fetchProfile(string $instance, string $number): array
    {
        $response = $this->client()->post("/chat/fetchProfile/{$instance}", [
            'number' => $number,
        ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function fetchProfilePictureUrl(string $instance, string $number): array
    {
        $response = $this->client()->post("/chat/fetchProfilePictureUrl/{$instance}", [
            'number' => $number,
        ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function fetchBusinessProfile(string $instance, string $number): array
    {
        $response = $this->client()->post("/chat/fetchBusinessProfile/{$instance}", [
            'number' => $number,
        ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function whatsappNumbers(string $instance, string $number): array
    {
        $response = $this->client()->post("/chat/whatsappNumbers/{$instance}", [
            'numbers' => [$number],
        ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function findContacts(string $instance): array
    {
        $response = $this->client()->post("/chat/findContacts/{$instance}", []);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function fetchChats(string $instance): array
    {
        $response = $this->client()->get("/chat/findChats/{$instance}");

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function fetchMessages(string $instance, string $remoteJid, int $limit = 50): array
    {
        $response = $this->client()->post("/chat/fetchMessages/{$instance}", [
            'remoteJid' => $remoteJid,
            'limit' => $limit,
        ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function sendText(string $instance, string $number, string $text): array
    {
        $response = $this->client()->post("/message/sendText/{$instance}", [
                'number' => $number,
                'text' => $text,
            ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function sendMedia(string $instance, string $number, string $mediaType, string $mediaPath, string $mimetype, ?string $caption = null, ?string $fileName = null): array
    {
        $storagePath = $mediaPath;
        $storageUrl = rtrim(asset('storage/'), '/');
        if (str_starts_with($storagePath, $storageUrl.'/')) {
            $storagePath = trim(substr($storagePath, strlen($storageUrl)), '/');
        }

        $base64 = null;
        if (Storage::disk('public')->exists($storagePath)) {
            $base64 = base64_encode(Storage::disk('public')->get($storagePath));
        }

        $payload = [
            'number' => $number,
            'mediatype' => $mediaType,
            'mimetype' => $mimetype,
            'media' => $base64,
            'caption' => $caption ?? '',
            'fileName' => $fileName ?? basename($mediaPath),
        ];

        $response = $this->client()->post("/message/sendMedia/{$instance}", $payload);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function sendReaction(string $instance, string $number, string $reactionEmoji, string $originalMessageId): array
    {
        $response = $this->client()->post("/message/sendReaction/{$instance}", [
                'number' => $number,
                'key' => [
                    'id' => $originalMessageId,
                    'remoteJid' => $number.'@s.whatsapp.net',
                    'fromMe' => true,
                ],
                'reaction' => $reactionEmoji,
            ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function fetchGroups(string $instance): array
    {
        $response = $this->client()->get("/group/fetchAllGroups/{$instance}", [
                'getParticipants' => 'true',
            ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function findGroupInfos(string $instance, string $groupJid): array
    {
        $response = $this->client()->get("/group/findGroupInfos/{$instance}", [
                'groupJid' => $groupJid,
            ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function inviteInfo(string $instance, string $inviteCode): array
    {
        $response = $this->client()->get("/group/inviteInfo/{$instance}", [
                'inviteCode' => $inviteCode,
            ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function getBase64FromMediaMessage(string $instance, string $messageId, string $remoteJid): array
    {
        $response = $this->client()->post("/chat/getBase64FromMediaMessage/{$instance}", [
            'message' => [
                'key' => [
                    'id' => $messageId,
                    'remoteJid' => $remoteJid,
                    'fromMe' => false,
                ],
            ],
        ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function setWebhook(string $instance, string $url, bool $enabled = true, array $events = ['MESSAGES_UPSERT']): array
    {
        $response = $this->client()->post("/webhook/set/{$instance}", [
            'webhook' => [
                'enabled' => $enabled,
                'url' => $url,
                'webhookBase64' => true,
                'events' => $events,
            ],
        ]);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error (setWebhook): {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function setWebhookWithAllEvents(string $instance, string $url): array
    {
        return $this->setWebhook($instance, $url, true, [
            'MESSAGES_UPSERT',
            'SEND_MESSAGE',
            'MESSAGES_UPDATE',
            'CONNECTION_UPDATE',
            'QRCODE_UPDATED',
            'LOGOUT_INSTANCE',
            'REMOVE_INSTANCE',
            'APPLICATION_STARTUP',
            'CALL',
        ]);
    }

    public function fetchWebhookStatus(string $instance): ?array
    {
        try {
            $response = $this->client()->get("/webhook/find/{$instance}");

            if ($response->failed()) {
                return null;
            }

            return $response->json() ?? [];
        } catch (\Exception $e) {
            report($e);

            return null;
        }
    }

    private function client(): PendingRequest
    {
        return Http::baseUrl($this->serverUrl)
            ->withHeader('apikey', $this->apiKey)
            ->acceptJson()
            ->timeout(0)
            ->connectTimeout(0);
    }
}
