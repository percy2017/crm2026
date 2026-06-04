<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LinkPreviewController extends Controller
{
    public function preview(Request $request): JsonResponse
    {
        $request->validate(['url' => 'required|url']);

        $url = $request->input('url');

        try {
            $response = Http::timeout(5)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; CRM/1.0)'])
                ->get($url);

            if (! $response->successful()) {
                return response()->json(['url' => $url]);
            }

            $html = $response->body();

            $title = $this->extractMeta($html, 'og:title')
                ?? $this->extractTitle($html)
                ?? null;

            $description = $this->extractMeta($html, 'og:description')
                ?? $this->extractMeta($html, 'description')
                ?? null;

            $image = $this->extractMeta($html, 'og:image')
                ?? null;

            if ($image && ! str_starts_with($image, 'http')) {
                $parsed = parse_url($url);
                $base = ($parsed['scheme'] ?? 'https').'://'.($parsed['host'] ?? '');
                $image = $base.'/'.ltrim($image, '/');
            }

            return response()->json([
                'url' => $url,
                'title' => $title,
                'description' => $description,
                'image' => $image,
            ]);
        } catch (\Exception $e) {
            return response()->json(['url' => $url]);
        }
    }

    private function extractMeta(string $html, string $property): ?string
    {
        $patterns = [
            '/<meta\s+[^>]*property=["\']'.preg_quote($property, '/').'["\'][^>]*content=["\']([^"\']*)["\'][^>]*\/?>/i',
            '/<meta\s+[^>]*content=["\']([^"\']*)["\'][^>]*property=["\']'.preg_quote($property, '/').'["\'][^>]*\/?>/i',
            '/<meta\s+[^>]*name=["\']'.preg_quote($property, '/').'["\'][^>]*content=["\']([^"\']*)["\'][^>]*\/?>/i',
            '/<meta\s+[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']'.preg_quote($property, '/').'["\'][^>]*\/?>/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $html, $matches)) {
                return html_entity_decode($matches[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
            }
        }

        return null;
    }

    private function extractTitle(string $html): ?string
    {
        if (preg_match('/<title[^>]*>([^<]+)<\/title>/i', $html, $matches)) {
            return html_entity_decode(trim($matches[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }

        return null;
    }
}
