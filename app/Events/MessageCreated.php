<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class MessageCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public string $instance,
        public string $channelId,
        public array $message,
        public array $contact,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('entradas.'.$this->instance)];
    }

    public function broadcastAs(): string
    {
        return 'message.created';
    }

    public function broadcastWith(): array
    {
        return [
            'channel_id' => $this->channelId,
            'message' => $this->message,
            'contact' => $this->contact,
        ];
    }
}
