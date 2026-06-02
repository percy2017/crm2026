<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\EvolutionWebhook;
use App\Models\Inbox;
use App\Models\Message;
use App\Services\EvolutionApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class InboxCrudController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/inboxes/index', [
            'inboxes' => Inbox::orderBy('name')->get(),
        ]);
    }

    public function create(EvolutionApiService $evolution): Response
    {
        $instances = [];

        try {
            $allInstances = $evolution->fetchInstances();

            $existingNames = Inbox::where('type', 'evolution')->pluck('name')->toArray();

            $instances = array_values(array_filter($allInstances, fn ($inst) => ! in_array($inst['name'] ?? null, $existingNames)));
        } catch (\Exception $e) {
            report($e);
        }

        return Inertia::render('admin/inboxes/create', [
            'instances' => $instances,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:inboxes,name',
            'type' => 'required|string|in:evolution,web',
        ]);

        if ($data['type'] === 'evolution' && Inbox::where('type', 'evolution')->where('name', $data['name'])->exists()) {
            return response()->json(['error' => 'Ya existe un inbox para esta instancia de Evolution'], 422);
        }

        if ($data['type'] === 'web') {
            $inbox = Inbox::create([
                'name' => $data['name'],
                'type' => 'web',
                'status' => 'active',
                'config' => [
                    'domain' => $data['name'].'.localhost',
                    'color' => '#3b82f6',
                    'position' => 'right',
                    'greeting' => 'Hola, ¿en qué podemos ayudarte?',
                ],
            ]);

            return response()->json(['inbox' => $inbox], 201);
        }

        $inbox = Inbox::create([
            'name' => $data['name'],
            'type' => 'evolution',
            'status' => 'active',
        ]);

        try {
            $evolution = app(EvolutionApiService::class);
            $instances = $evolution->fetchInstances();
            $instanceData = null;

            foreach ($instances as $inst) {
                if ($inst['name'] === $inbox->name) {
                    $instanceData = $inst;
                    break;
                }
            }

            $config = $instanceData ? [
                'instanceId' => $instanceData['id'] ?? null,
                'apikey' => $instanceData['token'] ?? null,
                'ownerJid' => $instanceData['ownerJid'] ?? null,
                'profileName' => $instanceData['profileName'] ?? null,
                'profilePicUrl' => $instanceData['profilePicUrl'] ?? null,
                'connectionStatus' => $instanceData['connectionStatus'] ?? null,
                'number' => $instanceData['number'] ?? ($instanceData['ownerJid'] ? explode('@', $instanceData['ownerJid'])[0] : null),
                'integration' => $instanceData['integration'] ?? null,
            ] : [];

            $url = url('/api/webhooks/evolution/'.$inbox->name);

            $evolution->setWebhook($inbox->name, $url, true, ['MESSAGES_UPSERT']);

            $inbox->update([
                'config' => $config,
                'webhook_url' => $url,
                'webhook_enabled' => true,
            ]);
        } catch (\Exception $e) {
            report($e);

            return response()->json([
                'inbox' => $inbox->fresh(),
                'warning' => 'Inbox created but webhook configuration failed: '.$e->getMessage(),
            ], 201);
        }

        return response()->json(['inbox' => $inbox->fresh()], 201);
    }

    public function destroy(Inbox $inbox): JsonResponse
    {
        $channelIds = Conversation::where('inbox_id', $inbox->id)->pluck('channel_id');

        if ($channelIds->isNotEmpty()) {
            $mediaFiles = Message::whereIn('channel_id', $channelIds)
                ->whereNotNull('media_url')
                ->pluck('media_url')
                ->filter();

            foreach ($mediaFiles as $file) {
                Storage::disk('public')->delete($file);
            }

            Message::whereIn('channel_id', $channelIds)->delete();
        }

        Conversation::where('inbox_id', $inbox->id)->delete();

        EvolutionWebhook::where('instance', $inbox->name)->delete();

        $inbox->delete();

        return response()->json(['deleted' => true]);
    }
}
