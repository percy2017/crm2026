<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\Process\Process;

class LinkPreviewController extends Controller
{
    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'url' => 'required|string',
            'message_id' => 'nullable|integer|exists:messages,id',
        ]);

        $url = $request->input('url');
        $url = preg_replace('/[^\x20-\x7E]/', '', $url);
        $url = trim($url);

        $host = parse_url($url, PHP_URL_HOST);
        if (! $host) {
            return response()->json([
                'url' => $url,
                'title' => null,
                'description' => null,
                'image' => null,
            ]);
        }

        // If message_id provided and link_preview exists, return cached
        $messageId = $request->input('message_id');
        if ($messageId) {
            $message = Message::find($messageId);
            if ($message && $message->link_preview) {
                return response()->json($message->link_preview);
            }
        }

        // All URLs: use Chromium worker for real OG tags
        $result = $this->fetchWithChromium($url);
        $this->savePreview($messageId, $result);

        return response()->json($result);
    }

    private function fetchWithChromium(string $url): array
    {
        $script = base_path('scripts/link-preview-worker.cjs');

        $process = new Process(['node', $script, $url]);
        $process->setTimeout(30);
        $process->run();

        if (! $process->isSuccessful()) {
            return [
                'url' => $url,
                'title' => null,
                'description' => null,
                'image' => null,
            ];
        }

        $output = $process->getOutput();
        $data = json_decode($output, true);

        if ($data && isset($data['image'])) {
            return [
                'url' => $url,
                'title' => $data['title'] ?? null,
                'description' => $data['description'] ?? null,
                'image' => $data['image'],
            ];
        }

        return [
            'url' => $url,
            'title' => null,
            'description' => null,
            'image' => null,
        ];
    }

    private function savePreview(?int $messageId, array $data): void
    {
        if (! $messageId) {
            return;
        }

        $message = Message::find($messageId);
        if ($message) {
            $message->link_preview = $data;
            $message->save();
        }
    }
}
