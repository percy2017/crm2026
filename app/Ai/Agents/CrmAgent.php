<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

class CrmAgent implements Agent
{
    use Promptable;

    private ?array $pageContext = null;

    public function setPageContext(?array $context): void
    {
        $this->pageContext = $context;
    }

    public function instructions(): Stringable|string
    {
        $base = config('ai.agent.instructions');

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
