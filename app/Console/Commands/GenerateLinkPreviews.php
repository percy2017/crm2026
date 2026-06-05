<?php

namespace App\Console\Commands;

use App\Models\Message;
use App\Services\EvolutionApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class GenerateLinkPreviews extends Command
{
    protected $signature = 'app:generate-link-previews';
    protected $description = 'Generate link previews for messages with URLs but no preview yet';
    public $timeout = 120;

    public function handle(): int
    {
        $messages = Message::whereNull('link_preview')
            ->whereNotNull('text')
            ->where('text', '!=', '')
            ->get(['id', 'text', 'instance', 'channel_id']);

        if ($messages->isEmpty()) {
            $this->info('No messages without link_preview found');

            return 0;
        }

        $urlMap = [];
        foreach ($messages as $message) {
            preg_match_all('/https?:\/\/[^\s<]+/', $message->text, $matches);
            foreach ($matches[0] as $url) {
                $normalized = preg_replace('/[^\x20-\x7E]/', '', trim($url));
                $key = md5($normalized);
                $urlMap[$key]['url'] = $normalized;
                $urlMap[$key]['message_ids'][] = $message->id;
                if (!isset($urlMap[$key]['channel_id']) && str_contains($normalized, 'chat.whatsapp.com')) {
                    $urlMap[$key]['channel_id'] = $message->channel_id;
                    $urlMap[$key]['instance'] = $message->instance;
                }
            }
        }

        if (empty($urlMap)) {
            $this->info('No URLs found in messages');

            return 0;
        }

        $processed = 0;
        $cached = 0;
        $failed = 0;

        foreach ($urlMap as $key => $entry) {
            $url = $entry['url'];
            $messageIds = $entry['message_ids'];

            $existing = Message::whereIn('id', $messageIds)
                ->whereNotNull('link_preview')
                ->first();

            if ($existing) {
                $preview = $existing->link_preview;
                Message::whereIn('id', $messageIds)
                    ->whereNull('link_preview')
                    ->update(['link_preview' => json_encode($preview)]);
                $cached++;
                $this->line("  [CACHE] {$url}");

                continue;
            }

            if (preg_match('/google\.com\/maps|maps\.google/', $url)) {
                $this->line("  [SKIP MAP] {$url}");

                continue;
            }

            $this->line("  [FETCH] {$url}");

            $preview = null;

            if (str_contains($url, 'chat.whatsapp.com') && isset($entry['channel_id'])) {
                $preview = $this->fetchWhatsAppGroupPreview($entry['instance'], $entry['channel_id'], $url);
            }

            if (!$preview) {
                $preview = $this->fetchWithChromium($url);
            }

            if ($preview && $preview['image']) {
                $localImage = $this->downloadToStorage($preview['image']);
                if ($localImage) {
                    $preview['image'] = $localImage;
                }
            }

            if ($preview && ($preview['image'] || $preview['title'])) {
                Message::whereIn('id', $messageIds)
                    ->whereNull('link_preview')
                    ->update(['link_preview' => json_encode($preview)]);
                $processed++;
                $this->line("    -> saved (image: " . ($preview['image'] ? 'yes' : 'no') . ", title: " . ($preview['title'] ? substr($preview['title'], 0, 40) : 'no') . ")");
            } else {
                $nullPreview = json_encode(['url' => $url, 'title' => null, 'description' => null, 'image' => null]);
                Message::whereIn('id', $messageIds)
                    ->whereNull('link_preview')
                    ->update(['link_preview' => $nullPreview]);
                $failed++;
                $this->line("    -> no OG data found");
            }
        }

        $this->info("Done: {$processed} fetched, {$cached} cached, {$failed} failed");

        return 0;
    }

    private function fetchWhatsAppGroupPreview(string $instance, string $channelId, string $url): ?array
    {
        try {
            $evolution = app(EvolutionApiService::class);

            preg_match('#chat\.whatsapp\.com/([a-zA-Z0-9]+)#', $url, $m);
            $inviteCode = $m[1] ?? null;

            if (! $inviteCode) {
                return null;
            }

            $inviteInfo = $evolution->inviteInfo($instance, $inviteCode);
            $groupId = $inviteInfo['id'] ?? null;

            if (! $groupId) {
                return null;
            }

            $groupInfo = $evolution->findGroupInfos($instance, $groupId);
            $pictureUrl = $groupInfo['pictureUrl'] ?? null;
            $localImage = null;

            if ($pictureUrl) {
                $localImage = $this->downloadToStorage($pictureUrl);
            }

            return [
                'url' => $url,
                'title' => 'Invitación a grupo de WhatsApp',
                'description' => $groupInfo['subject'] ?? null,
                'image' => $localImage,
            ];
        } catch (\Exception $e) {
            $this->line("    -> Evolution API error: " . $e->getMessage());
        }

        return null;
    }

    private function downloadToStorage(string $url): ?string
    {
        try {
            $response = Http::timeout(10)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                ->get($url);

            if (! $response->ok()) {
                return null;
            }

            $contentType = $response->header('Content-Type');
            $ext = match (true) {
                str_contains($contentType, 'jpeg') => 'jpg',
                str_contains($contentType, 'jpg') => 'jpg',
                str_contains($contentType, 'png') => 'png',
                str_contains($contentType, 'webp') => 'webp',
                default => 'jpg',
            };

            $filename = md5($url) . '.' . $ext;
            Storage::disk('public')->put($filename, $response->body());

            return $filename;
        } catch (\Exception $e) {
            $this->line("    -> Download error: " . $e->getMessage());
        }

        return null;
    }

    private function fetchWithChromium(string $url): array
    {
        $script = base_path('scripts/link-preview-worker.cjs');

        $process = new Process(['node', $script, $url]);
        $process->setTimeout(30);
        $process->run();

        if (! $process->isSuccessful()) {
            return ['url' => $url, 'title' => null, 'description' => null, 'image' => null];
        }

        $output = $process->getOutput();
        $data = json_decode($output, true);

        if ($data && ($data['image'] || $data['title'])) {
            return [
                'url' => $url,
                'title' => $data['title'] ?? null,
                'description' => $data['description'] ?? null,
                'image' => $data['image'] ?: null,
            ];
        }

        return ['url' => $url, 'title' => null, 'description' => null, 'image' => null];
    }
}
