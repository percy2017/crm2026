<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class WebMessageCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public int $conversationId,
        public int $visitorId,
        public string $visitorName,
        public int $widgetId,
        public string $widgetName,
        public array $message,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('web-chat')];
    }

    public function broadcastAs(): string
    {
        return 'web-message.created';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'visitor_id' => $this->visitorId,
            'visitor_name' => $this->visitorName,
            'widget_id' => $this->widgetId,
            'widget_name' => $this->widgetName,
            'message' => $this->message,
        ];
    }
}
