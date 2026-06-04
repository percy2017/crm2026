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
            'conversation_context' => 'nullable|array',
            'conversation_context.contact_name' => 'nullable|string|max:500',
            'conversation_context.contact_phone' => 'nullable|string|max:100',
            'conversation_context.recent_messages' => 'nullable|array',
        ]);

        try {
            $agent = new CrmAgent;

            if ($context = $validated['page_context'] ?? null) {
                $agent->setPageContext($context);
            }

            if ($convContext = $validated['conversation_context'] ?? null) {
                $agent->setConversationContext($convContext);
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
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Error al generar respuesta: ' . $e->getMessage(),
            ], 500);
        }
    }
}
