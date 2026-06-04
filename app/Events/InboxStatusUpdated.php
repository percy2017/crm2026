<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class InboxStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public string $instance,
        public string $connectionStatus,
        public string $inboxStatus,
        public ?string $lastMessageAt = null,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('entradas.'.$this->instance),
            new PrivateChannel('inboxes.global'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'inbox.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'instance' => $this->instance,
            'connection_status' => $this->connectionStatus,
            'inbox_status' => $this->inboxStatus,
            'last_message_at' => $this->lastMessageAt,
        ];
    }
}
