<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    public function list(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 20), 100);
        $page = max((int) $request->input('page', 1), 1);

        $files = collect(Storage::disk('public')->files())
            ->filter(fn (string $path) => $path !== '.gitignore')
            ->map(fn (string $path) => [
                'name' => $path,
                'size' => Storage::disk('public')->size($path),
                'mime' => Storage::disk('public')->mimeType($path),
                'last_modified' => Storage::disk('public')->lastModified($path),
                'url' => Storage::disk('public')->url($path),
            ])
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
