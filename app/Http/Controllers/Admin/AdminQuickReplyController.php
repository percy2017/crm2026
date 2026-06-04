<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuickReply;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
            'media_url' => 'nullable|string',
            'media_type' => 'nullable|string|max:20',
        ]);

        $reply = QuickReply::create($request->only(['shortcut', 'message', 'media_url', 'media_type']));

        return response()->json($reply, 201);
    }

    public function update(Request $request, QuickReply $quickReply): JsonResponse
    {
        $request->validate([
            'shortcut' => 'required|string|max:50|unique:quick_replies,shortcut,'.$quickReply->id,
            'message' => 'nullable|string',
            'media_url' => 'nullable|string',
            'media_type' => 'nullable|string|max:20',
        ]);

        $quickReply->update($request->only(['shortcut', 'message', 'media_url', 'media_type']));

        return response()->json($quickReply);
    }

    public function destroy(QuickReply $quickReply): JsonResponse
    {
        $quickReply->delete();

        return response()->json(['deleted' => true]);
    }
}
