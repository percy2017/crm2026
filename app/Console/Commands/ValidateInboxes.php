<?php

namespace App\Console\Commands;

use App\Models\Inbox;
use App\Services\EvolutionApiService;
use Illuminate\Console\Command;

class ValidateInboxes extends Command
{
    protected $signature = 'inbox:validate';

    protected $description = 'Check evolution inboxes against Evolution API and mark removed ones as inactive';

    public function handle(EvolutionApiService $evolution): int
    {
        $inboxes = Inbox::where('type', 'evolution')->where('status', 'active')->get();

        if ($inboxes->isEmpty()) {
            $this->warn('No active evolution inboxes found.');

            return 0;
        }

        try {
            $instances = $evolution->fetchInstances();
        } catch (\Exception $e) {
            $this->error('Failed to fetch instances from Evolution API: '.$e->getMessage());

            return 1;
        }

        $validNames = collect($instances)->pluck('name')->filter()->values()->all();

        $bar = $this->output->createProgressBar($inboxes->count());
        $bar->start();

        $removed = 0;
        $updated = 0;

        foreach ($inboxes as $inbox) {
            if (! in_array($inbox->name, $validNames)) {
                $config = $inbox->config ?? [];
                $config['connectionStatus'] = 'removed';
                $inbox->update([
                    'status' => 'inactive',
                    'config' => $config,
                ]);
                $this->line(" {$inbox->name} → inactive (not found in Evolution API)");
                $removed++;
            } else {
                $instanceData = collect($instances)->firstWhere('name', $inbox->name);
                $status = $instanceData['connectionStatus'] ?? null;

                if ($status) {
                    $config = $inbox->config ?? [];
                    $config['connectionStatus'] = $status;
                    $inbox->update(['config' => $config]);
                }

                $updated++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Done. {$updated} updated, {$removed} removed.");

        return 0;
    }
}
