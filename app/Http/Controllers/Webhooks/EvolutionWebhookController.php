<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\EvolutionWebhook;
use Illuminate\Http\Request;

class EvolutionWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $apiKey = $request->header('apikey') ?? $request->header('x-api-key');

        if ($apiKey !== config('evolution.api_key')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $payload = $request->all();

        EvolutionWebhook::create([
            'instance' => $payload['instance'] ?? $request->route('instance'),
            'event' => $payload['event'] ?? null,
            'payload' => $payload,
        ]);

        return response()->json(['status' => 'ok']);
    }
}
