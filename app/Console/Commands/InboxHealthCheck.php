<?php

namespace App\Console\Commands;

use App\Events\InboxStatusUpdated;
use App\Models\Inbox;
use App\Models\Message;
use Illuminate\Console\Command;

class InboxHealthCheck extends Command
{
    protected $signature = 'inbox:health-check';

    protected $description = 'Check inboxes for silent failures and broadcast stale status';

    public function handle(): int
    {
        $inboxes = Inbox::where('status', 'active')->where('type', 'evolution')->get();

        if ($inboxes->isEmpty()) {
            $this->warn('No active evolution inboxes found.');

            return 0;
        }

        $threshold = now()->subMinutes(5);

        foreach ($inboxes as $inbox) {
            $lastMessage = Message::where('instance', $inbox->name)
                ->where('input_output', true)
                ->latest('created_at')
                ->first();

            $connectionStatus = $inbox->config['connectionStatus'] ?? 'unknown';

            if ($connectionStatus === 'open') {
                $healthy = $lastMessage && $lastMessage->created_at >= $threshold;

                if (! $healthy) {
                    $this->warn("{$inbox->name} → stale (last message: ".($lastMessage?->created_at?->diffForHumans() ?? 'never').')');

                    try {
                        broadcast(new InboxStatusUpdated(
                            $inbox->name,
                            'stale',
                            'active',
                            $lastMessage?->created_at?->toISOString(),
                        ));
                    } catch (\Exception) {
                        // broadcast rate-limited
                    }
                }
            }
        }

        $this->info('Health check completed.');

        return 0;
    }
}
