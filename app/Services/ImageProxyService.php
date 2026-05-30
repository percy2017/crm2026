<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageProxyService
{
    public function download(string $url): ?string
    {
        if (empty($url)) {
            return null;
        }

        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept' => 'image/webp,image/*,*/*;q=0.8',
        ])->get($url);

        if ($response->failed()) {
            return null;
        }

        $filename = Str::uuid().'.jpg';
        Storage::disk('public')->put($filename, $response->body());

        return $filename;
    }
}
