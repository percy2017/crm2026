<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuickReply;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminQuickReplyController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/quick-replies/index');
    }

    public function list(): JsonResponse
    {
        return response()->json(QuickReply::orderBy('shortcut')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'shortcut' => 'required|string|max:50|unique:quick_replies',
            'message' => 'nullable|string',
            'file' => 'nullable|file|max:102400',
            'media_type' => 'nullable|string|max:20',
        ]);

        $data = $request->only(['shortcut', 'message', 'media_type']);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = Str::uuid().'_'.$file->getClientOriginalName();
            Storage::disk('public')->put($filename, file_get_contents($file->getRealPath()));
            $data['media_url'] = $filename;
        }

        $reply = QuickReply::create($data);

        return response()->json($reply, 201);
    }

    public function update(Request $request, QuickReply $quickReply): JsonResponse
    {
        $request->validate([
            'shortcut' => 'required|string|max:50|unique:quick_replies,shortcut,'.$quickReply->id,
            'message' => 'nullable|string',
            'file' => 'nullable|file|max:102400',
            'media_type' => 'nullable|string|max:20',
        ]);

        $data = $request->only(['shortcut', 'message', 'media_type']);

        if ($request->hasFile('file')) {
            if ($quickReply->media_url) {
                if (Storage::disk('public')->exists($quickReply->media_url)) {
                    Storage::disk('public')->delete($quickReply->media_url);
                }
            }

            $file = $request->file('file');
            $filename = Str::uuid().'_'.$file->getClientOriginalName();
            Storage::disk('public')->put($filename, file_get_contents($file->getRealPath()));
            $data['media_url'] = $filename;
        } elseif ($request->input('remove_media') === '1') {
            if ($quickReply->media_url) {
                if (Storage::disk('public')->exists($quickReply->media_url)) {
                    Storage::disk('public')->delete($quickReply->media_url);
                }
            }
            $data['media_url'] = null;
        }

        $quickReply->update($data);

        return response()->json($quickReply);
    }

    public function destroy(QuickReply $quickReply): JsonResponse
    {
        if ($quickReply->media_url && Storage::disk('public')->exists($quickReply->media_url)) {
            Storage::disk('public')->delete($quickReply->media_url);
        }

        $quickReply->delete();

        return response()->json(['deleted' => true]);
    }
}
