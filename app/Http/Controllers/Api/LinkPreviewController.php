<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LinkPreviewController extends Controller
{
    private const BOT_BLOCKERS = [
        'facebook.com', 'www.facebook.com', 'm.facebook.com',
        'instagram.com', 'www.instagram.com',
        'tiktok.com', 'www.tiktok.com', 'vm.tiktok.com',
        'threads.net', 'www.threads.net',
    ];

    public function preview(Request $request): JsonResponse
    {
        $request->validate(['url' => 'required|url']);

        $url = $request->input('url');
        $host = parse_url($url, PHP_URL_HOST) ?? '';

        // Google Maps: extract coords and generate static map image
        $googleMaps = $this->resolveGoogleMaps($url);
        if ($googleMaps) {
            return response()->json($googleMaps);
        }

        // Skip HTTP fetch for known bot-blocking sites
        if (in_array($host, self::BOT_BLOCKERS, true)) {
            return response()->json([
                'url' => $url,
                'title' => null,
                'description' => null,
                'image' => null,
            ]);
        }

        // YouTube: known image without HTTP fetch
        $knownImage = $this->knownYouTubeImage($url);
        if ($knownImage) {
            return response()->json([
                'url' => $url,
                'title' => null,
                'description' => null,
                'image' => $knownImage,
            ]);
        }

        try {
            $response = Http::timeout(8)
                ->withOptions(['allow_redirects' => true])
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language' => 'es-ES,es;q=0.9,en;q=0.8',
                ])
                ->get($url);

            $html = $response->body();

            $title = $this->extractMeta($html, 'og:title')
                ?? $this->extractMeta($html, 'twitter:title')
                ?? $this->extractTitle($html)
                ?? null;

            $description = $this->extractMeta($html, 'og:description')
                ?? $this->extractMeta($html, 'twitter:description')
                ?? $this->extractMeta($html, 'description')
                ?? null;

            $image = $this->extractMeta($html, 'og:image')
                ?? $this->extractMeta($html, 'twitter:image')
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
            return response()->json([
                'url' => $url,
                'title' => null,
                'description' => null,
                'image' => null,
            ]);
        }
    }

    private function knownYouTubeImage(string $url): ?string
    {
        if (preg_match('%(?:youtube(?:-nocookie)?\.com/(?:[^/]*/.*|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/\s]{11})%i', $url, $match)) {
            return 'https://img.youtube.com/vi/'.$match[1].'/hqdefault.jpg';
        }

        return null;
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

    private function resolveGoogleMaps(string $url): ?array
    {
        $host = parse_url($url, PHP_URL_HOST) ?? '';

        $isGoogleMaps = str_contains($host, 'goo.gl')
            || str_contains($host, 'google.com/maps')
            || str_contains($host, 'googlemaps.com');

        if (! $isGoogleMaps) {
            return null;
        }

        try {
            $response = Http::timeout(8)
                ->withOptions(['allow_redirects' => true])
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                ])
                ->get($url);

            $finalUrl = (string) $response->effectiveUri();
            $html = $response->body();

            $lat = null;
            $lng = null;
            $title = null;

            if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $finalUrl, $coords)) {
                $lat = $coords[1];
                $lng = $coords[2];
            }

            if (preg_match('/place\/([^\/@?]+)/', $finalUrl, $place)) {
                $title = urldecode($place[1]);
            }

            if (! $title) {
                $title = $this->extractMeta($html, 'og:title')
                    ?? $this->extractTitle($html);
            }

            $description = $this->extractMeta($html, 'og:description')
                ?? $this->extractMeta($html, 'description');

            $image = null;
            if ($lat && $lng) {
                $image = "https://staticmap.openstreetmap.de/staticmap.php?center={$lat},{$lng}&zoom=15&size=600x300&maptype=mapnik";
            }

            return [
                'url' => $finalUrl,
                'title' => $title,
                'description' => $description ?: 'Google Maps',
                'image' => $image,
            ];
        } catch (\Exception $e) {
            return [
                'url' => $url,
                'title' => 'Google Maps',
                'description' => null,
                'image' => null,
            ];
        }
    }
}
