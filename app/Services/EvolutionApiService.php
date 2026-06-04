<?php

namespace App\Services;

use App\Models\Inbox;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
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
        $response = Http::baseUrl($this->serverUrl)
            ->withHeader('apikey', $this->apiKey)
            ->acceptJson()
            ->timeout(120)
            ->post("/chat/findContacts/{$instance}", []);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function fetchChats(string $instance): array
    {
        $response = Http::baseUrl($this->serverUrl)
            ->withHeader('apikey', $this->apiKey)
            ->acceptJson()
            ->timeout(30)
            ->get("/chat/findChats/{$instance}");

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

    public function sendMedia(string $instance, string $number, string $mediaType, string $mediaUrl, string $mimetype, ?string $caption = null, ?string $fileName = null): array
    {
        $payload = [
            'number' => $number,
            'mediatype' => $mediaType,
            'mimetype' => $mimetype,
            'media' => $mediaUrl,
            'caption' => $caption ?? '',
            'fileName' => $fileName ?? basename(rawurldecode($mediaUrl)),
        ];

        $response = Http::baseUrl($this->serverUrl)
            ->withHeader('apikey', $this->apiKey)
            ->acceptJson()
            ->timeout(120)
            ->post("/message/sendMedia/{$instance}", $payload);

        if ($response->failed()) {
            throw new RuntimeException(
                "Evolution API error: {$response->status()} - {$response->body()}"
            );
        }

        return $response->json() ?? [];
    }

    public function sendReaction(string $instance, string $number, string $reactionEmoji, string $originalMessageId): array
    {
        $response = Http::baseUrl($this->serverUrl)
            ->withHeader('apikey', $this->apiKey)
            ->acceptJson()
            ->timeout(30)
            ->post("/message/sendReaction/{$instance}", [
                'number' => $number,
                'reactionMessage' => [
                    'key' => ['id' => $originalMessageId],
                    'text' => $reactionEmoji,
                ],
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
        $response = Http::baseUrl($this->serverUrl)
            ->withHeader('apikey', $this->apiKey)
            ->acceptJson()
            ->timeout(120)
            ->get("/group/fetchAllGroups/{$instance}", [
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
        $response = Http::baseUrl($this->serverUrl)
            ->withHeader('apikey', $this->apiKey)
            ->acceptJson()
            ->timeout(30)
            ->get("/group/findGroupInfos/{$instance}", [
                'groupJid' => $groupJid,
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
            ->timeout(10);
    }
}
