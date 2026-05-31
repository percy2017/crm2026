<?php

namespace App\Http\Controllers\Admin;

use App\Ai\Agents\CrmAgent;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Ai\Enums\Lab;

class AdminAiAgentController extends Controller
{
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:5000',
            'page_context' => 'nullable|array',
            'page_context.url' => 'nullable|string|max:500',
            'page_context.component' => 'nullable|string|max:200',
        ]);

        $agent = new CrmAgent;

        if ($context = $validated['page_context'] ?? null) {
            $agent->setPageContext($context);
        }

        $response = $agent->prompt(
            $validated['message'],
            provider: Lab::from(config('ai.agent.provider')),
            model: config('ai.agent.model'),
            timeout: 120,
        );

        return response()->json([
            'message' => (string) $response,
        ]);
    }
}
