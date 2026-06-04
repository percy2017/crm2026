<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\EvolutionWebhook;
use App\Models\Inbox;
use App\Models\Message;
use App\Services\EvolutionApiService;
use App\Services\InboxBackupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class InboxCrudController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/inboxes/index', [
            'inboxes' => Inbox::orderBy('name')->get(),
        ]);
    }

    public function listJson(): JsonResponse
    {
        return response()->json(
            Inbox::where('status', 'active')->orderBy('name')->get(['id', 'name', 'type'])
        );
    }

    public function backups(InboxBackupService $service): Response
    {
        return Inertia::render('admin/inboxes/backups', [
            'backups' => $service->listBackups(),
            'inboxes' => Inbox::where('status', 'active')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function backup(Inbox $inbox, InboxBackupService $service): JsonResponse
    {
        try {
            $filename = $service->backup($inbox->name);

            return response()->json([
                'filename' => $filename,
                'url' => route('admin.inboxes.backups.download', ['filename' => $filename]),
            ]);
        } catch (\Exception $e) {
            report($e);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function downloadBackup(string $filename): BinaryFileResponse
    {
        $path = storage_path("app/backups/{$filename}");

        if (! file_exists($path)) {
            abort(404);
        }

        return response()->download($path);
    }

    public function deleteBackup(string $filename, InboxBackupService $service): JsonResponse
    {
        $service->deleteBackup($filename);

        return response()->json(['deleted' => true]);
    }

    public function create(EvolutionApiService $evolution): Response
    {
        $instances = [];

        try {
            $allInstances = $evolution->fetchInstances();

            $existingActive = Inbox::where('type', 'evolution')->where('status', 'active')->pluck('name')->toArray();

            $instances = array_values(array_filter($allInstances, fn ($inst) => ! in_array($inst['name'] ?? null, $existingActive)));
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
            'name' => 'required|string|max:100',
            'type' => 'required|string|in:evolution,web',
            'domain' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
            'position' => 'nullable|in:left,right',
        ]);

        if ($data['type'] === 'web') {
            $rawDomain = $request->input('domain', '');
            $domain = str_starts_with($rawDomain, 'http') ? parse_url($rawDomain, PHP_URL_HOST) : ($rawDomain ?: $data['name'].'.localhost');

            $inbox = Inbox::create([
                'name' => $data['name'],
                'type' => 'web',
                'status' => 'active',
                'config' => [
                    'domain' => $domain,
                    'color' => $request->input('color', '#3b82f6'),
                    'position' => $request->input('position', 'right'),
                    'greeting' => 'Hola, ¿en qué podemos ayudarte?',
                ],
            ]);

            return response()->json(['inbox' => $inbox->fresh()], 201);
        }

        $existing = Inbox::where('type', 'evolution')->where('name', $data['name'])->first();

        if ($existing && $existing->status === 'active') {
            return response()->json(['error' => 'Ya existe un inbox activo para esta instancia de Evolution'], 422);
        }

        if ($existing && $existing->status === 'inactive') {
            $inbox = $existing;
        } else {
            $inbox = Inbox::create([
                'name' => $data['name'],
                'type' => 'evolution',
                'status' => 'active',
            ]);
        }

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

            $evolution->setWebhookWithAllEvents($inbox->name, $url);

            $inbox->update([
                'status' => 'active',
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

    public function edit(Inbox $inbox): Response
    {
        return Inertia::render('admin/inboxes/edit', [
            'inbox' => $inbox,
        ]);
    }

    public function update(Request $request, Inbox $inbox): JsonResponse
    {
        if ($inbox->type === 'web') {
            $data = $request->validate([
                'domain' => 'nullable|string|max:255',
                'color' => 'nullable|string|max:7',
                'position' => 'nullable|in:left,right',
                'greeting' => 'nullable|string|max:255',
            ]);

            $config = $inbox->config ?? [];
            $config['domain'] = $data['domain'] ?? $config['domain'] ?? $inbox->name.'.localhost';
            $config['color'] = $data['color'] ?? $config['color'] ?? '#3b82f6';
            $config['position'] = $data['position'] ?? $config['position'] ?? 'right';
            $config['greeting'] = $data['greeting'] ?? $config['greeting'] ?? 'Hola, ¿en qué podemos ayudarte?';

            $inbox->update(['config' => $config]);
        }

        if ($inbox->type === 'evolution') {
            $data = $request->validate([
                'status' => 'nullable|in:active,inactive',
                'webhook_url' => 'nullable|string',
                'webhook_enabled' => 'nullable|boolean',
            ]);

            $inbox->update(array_filter([
                'status' => $data['status'] ?? $inbox->status,
                'webhook_url' => $data['webhook_url'] ?? $inbox->webhook_url,
                'webhook_enabled' => $data['webhook_enabled'] ?? $inbox->webhook_enabled,
            ], fn ($v) => $v !== null));
        }

        return response()->json(['inbox' => $inbox->fresh()]);
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
