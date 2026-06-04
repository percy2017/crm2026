<?php

namespace App\Console\Commands;

use App\Models\Inbox;
use App\Services\InboxBackupService;
use Illuminate\Console\Command;

class BackupInbox extends Command
{
    protected $signature = 'inbox:backup {name? : Inbox name to backup. If omitted, backs up all active evolution inboxes}';

    protected $description = 'Generate a ZIP backup for one or all inboxes';

    public function handle(InboxBackupService $service): int
    {
        $name = $this->argument('name');

        if ($name) {
            $inboxes = Inbox::where('name', $name)->get();

            if ($inboxes->isEmpty()) {
                $this->error("Inbox '{$name}' not found.");

                return 1;
            }
        } else {
            $inboxes = Inbox::where('status', 'active')->where('type', 'evolution')->get();

            if ($inboxes->isEmpty()) {
                $this->warn('No active evolution inboxes found.');

                return 0;
            }
        }

        $bar = $this->output->createProgressBar($inboxes->count());
        $bar->start();

        $success = 0;
        $failed = 0;

        foreach ($inboxes as $inbox) {
            try {
                $filename = $service->backup($inbox->name);
                $this->line(" {$inbox->name} → {$filename}");
                $success++;
            } catch (\Exception $e) {
                $this->error(" {$inbox->name} → FAILED: {$e->getMessage()}");
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Done. {$success} succeeded, {$failed} failed.");

        return 0;
    }
}
