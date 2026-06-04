<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

class CrmAgent implements Agent
{
    use Promptable;

    private ?array $pageContext = null;

    private ?array $conversationContext = null;

    public function setPageContext(?array $context): void
    {
        $this->pageContext = $context;
    }

    public function setConversationContext(?array $context): void
    {
        $this->conversationContext = $context;
    }

    public function instructions(): Stringable|string
    {
        $base = config('ai.agent.instructions');

        if ($this->conversationContext) {
            $name = $this->conversationContext['contact_name'] ?? 'el contacto';
            $phone = $this->conversationContext['contact_phone'] ?? '';
            $messages = $this->conversationContext['recent_messages'] ?? [];

            $base .= "\n\nEstás conversando con {$name} ({$phone}).";

            if (count($messages) > 0) {
                $base .= "\n\nHistorial reciente:";
                foreach ($messages as $msg) {
                    $label = ($msg['role'] ?? 'unknown') === 'client' ? 'Cliente' : 'Tú';
                    $base .= "\n- {$label}: {$msg['text']}";
                }
            }

            $base .= "\n\nResponde de forma natural, breve y en español. No uses markdown. Solo texto plano, una sola respuesta.";
        }

        if ($this->pageContext) {
            $base .= sprintf(
                "\n\nEl usuario se encuentra en la sección: %s\nURL: %s",
                $this->pageContext['component'] ?? 'desconocida',
                $this->pageContext['url'] ?? '/',
            );
        }

        return $base;
    }
}
