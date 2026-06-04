<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class MessageStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public string $instance,
        public string $channelId,
        public string $messageId,
        public string $status,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('entradas.'.$this->instance)];
    }

    public function broadcastAs(): string
    {
        return 'message.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'channel_id' => $this->channelId,
            'message_id' => $this->messageId,
            'status' => $this->status,
        ];
    }
}
