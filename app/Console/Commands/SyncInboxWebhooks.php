<?php

namespace App\Console\Commands;

use App\Models\Inbox;
use App\Services\EvolutionApiService;
use Illuminate\Console\Command;

class SyncInboxWebhooks extends Command
{
    protected $signature = 'inbox:sync-webhooks';

    protected $description = 'Update webhooks for all evolution inboxes to receive all events';

    public function handle(EvolutionApiService $evolution): int
    {
        $inboxes = Inbox::where('type', 'evolution')
            ->where('status', 'active')
            ->get();

        if ($inboxes->isEmpty()) {
            $this->warn('No active evolution inboxes found.');

            return 0;
        }

        $bar = $this->output->createProgressBar($inboxes->count());
        $bar->start();

        $updated = 0;
        $failed = 0;

        foreach ($inboxes as $inbox) {
            try {
                $url = url('/api/webhooks/evolution/'.$inbox->name);
                $evolution->setWebhookWithAllEvents($inbox->name, $url);
                $updated++;
            } catch (\Exception $e) {
                $this->error("Failed for {$inbox->name}: {$e->getMessage()}");
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Done. {$updated} updated, {$failed} failed.");

        return 0;
    }
}
