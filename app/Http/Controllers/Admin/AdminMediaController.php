<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminMediaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/media/index');
    }

    public function stats(): JsonResponse
    {
        $isDocument = fn (string $mime) => in_array($mime, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain', 'text/csv', 'text/html', 'text/richtext',
        ]);

        $isArchive = fn (string $mime) => in_array($mime, [
            'application/zip', 'application/x-rar-compressed',
            'application/gzip', 'application/x-gzip', 'application/x-tar',
            'application/x-7z-compressed',
        ]);

        $files = collect(Storage::disk('public')->files())
            ->filter(fn (string $path) => $path !== '.gitignore')
            ->map(fn (string $path) => [
                'size' => Storage::disk('public')->size($path),
                'mime' => Storage::disk('public')->mimeType($path),
                'last_modified' => Storage::disk('public')->lastModified($path),
            ]);

        $totalFiles = $files->count();
        $totalSize = $files->sum('size');

        $byType = [
            'image' => 0, 'video' => 0, 'audio' => 0,
            'document' => 0, 'archive' => 0, 'other' => 0,
        ];

        foreach ($files as $file) {
            $mime = $file['mime'];
            $type = match (true) {
                str_starts_with($mime, 'image/') => 'image',
                str_starts_with($mime, 'video/') => 'video',
                str_starts_with($mime, 'audio/') => 'audio',
                $isDocument($mime) => 'document',
                $isArchive($mime) => 'archive',
                default => 'other',
            };
            $byType[$type]++;
        }

        $bySize = ['tiny' => 0, 'small' => 0, 'medium' => 0, 'large' => 0];

        foreach ($files as $file) {
            $size = $file['size'];
            $bucket = match (true) {
                $size < 100 * 1024 => 'tiny',
                $size < 1024 * 1024 => 'small',
                $size < 10 * 1024 * 1024 => 'medium',
                default => 'large',
            };
            $bySize[$bucket]++;
        }

        $now = now();
        $recent = ['today' => 0, 'week' => 0, 'month' => 0];

        foreach ($files as $file) {
            $ts = $file['last_modified'];
            $diff = $now->diffInDays($now->copy()->setTimestamp($ts));
            if ($diff === 0) {
                $recent['today']++;
            }
            if ($diff <= 7) {
                $recent['week']++;
            }
            if ($diff <= 30) {
                $recent['month']++;
            }
        }

        return response()->json([
            'total_files' => $totalFiles,
            'total_size' => $totalSize,
            'by_type' => $byType,
            'by_size' => $bySize,
            'recent' => $recent,
            'inboxes_with_media' => Message::whereNotNull('media_url')
                ->select('instance', DB::raw('count(*) as total'))
                ->groupBy('instance')
                ->orderBy('instance')
                ->get(),
        ]);
    }

    public function list(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 20), 100);
        $page = max((int) $request->input('page', 1), 1);
        $typeFilter = $request->input('type');
        $sizeFilter = $request->input('size');
        $inboxFilter = $request->input('inbox');

        $inboxFilenames = null;
        if ($inboxFilter) {
            $inboxFilenames = Message::where('instance', $inboxFilter)
                ->whereNotNull('media_url')
                ->pluck('media_url')
                ->map(fn (string $path) => basename($path))
                ->unique()
                ->values()
                ->all();
        }

        $files = collect(Storage::disk('public')->files())
            ->filter(fn (string $path) => $path !== '.gitignore')
            ->filter(function (string $path) use ($inboxFilenames) {
                if ($inboxFilenames === null) {
                    return true;
                }

                return in_array(basename($path), $inboxFilenames, true);
            })
            ->map(fn (string $path) => [
                'name' => $path,
                'size' => Storage::disk('public')->size($path),
                'mime' => Storage::disk('public')->mimeType($path),
                'last_modified' => Storage::disk('public')->lastModified($path),
                'url' => Storage::disk('public')->url($path),
            ])
            ->filter(function (array $file) use ($typeFilter, $sizeFilter) {
                if ($typeFilter) {
                    $mime = $file['mime'];

                    $isDocument = fn () => in_array($mime, [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'text/plain',
                        'text/csv',
                        'text/html',
                        'text/richtext',
                    ]);

                    $isArchive = fn () => in_array($mime, [
                        'application/zip',
                        'application/x-rar-compressed',
                        'application/gzip',
                        'application/x-gzip',
                        'application/x-tar',
                        'application/x-7z-compressed',
                    ]);

                    $match = match ($typeFilter) {
                        'image' => str_starts_with($mime, 'image/'),
                        'video' => str_starts_with($mime, 'video/'),
                        'audio' => str_starts_with($mime, 'audio/'),
                        'document' => $isDocument(),
                        'archive' => $isArchive(),
                        'other' => ! str_starts_with($mime, 'image/')
                            && ! str_starts_with($mime, 'video/')
                            && ! str_starts_with($mime, 'audio/')
                            && ! $isDocument()
                            && ! $isArchive(),
                        default => true,
                    };

                    if (! $match) {
                        return false;
                    }
                }

                if ($sizeFilter) {
                    $size = $file['size'];

                    $match = match ($sizeFilter) {
                        'tiny' => $size < 100 * 1024,
                        'small' => $size < 1024 * 1024,
                        'medium' => $size < 10 * 1024 * 1024,
                        'large' => $size >= 10 * 1024 * 1024,
                        default => true,
                    };

                    if (! $match) {
                        return false;
                    }
                }

                return true;
            })
            ->sortByDesc('last_modified')
            ->values();

        $total = $files->count();
        $items = $files->forPage($page, $perPage)->values();

        return response()->json([
            'data' => $items,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'has_more' => $page * $perPage < $total,
        ]);
    }

    public function upload(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:102400',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $filename = Str::uuid().'_'.$originalName;

        Storage::disk('public')->put($filename, file_get_contents($file->getRealPath()));

        if ($request->wantsJson()) {
            return response()->json(['filename' => $filename]);
        }

        return redirect()->route('admin.media.index');
    }

    public function destroy(string $filename): JsonResponse|RedirectResponse
    {
        if (! Storage::disk('public')->exists($filename)) {
            abort(404);
        }

        Storage::disk('public')->delete($filename);

        if (request()->wantsJson()) {
            return response()->json(['deleted' => true]);
        }

        return redirect()->route('admin.media.index');
    }
}
