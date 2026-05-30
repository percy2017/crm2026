<?php

namespace App\Console\Commands;

use App\Models\Contact;
use Illuminate\Console\Command;

class MigrateFromNotes extends Command
{
    protected $signature = 'contacts:migrate-from-notes';

    protected $description = 'Extract wa_status, description, website from notes JSON into dedicated columns and clean notes';

    public function handle(): int
    {
        $contacts = Contact::whereNotNull('notes')
            ->where('notes', 'like', '%"isBusiness"%')
            ->get();

        $bar = $this->output->createProgressBar($contacts->count());
        $bar->start();

        $updated = 0;

        foreach ($contacts as $contact) {
            $parsed = json_decode($contact->notes, true);
            if (! is_array($parsed) || ! isset($parsed['isBusiness'])) {
                $bar->advance();

                continue;
            }

            $data = [];

            if (isset($parsed['status'])) {
                $data['wa_status'] = $parsed['status'];
            }
            if (isset($parsed['description'])) {
                $data['description'] = $parsed['description'];
            }
            if (isset($parsed['website'])) {
                $data['website'] = $parsed['website'];
            }
            if (isset($parsed['isBusiness'])) {
                $data['is_business'] = (bool) $parsed['isBusiness'];
            }

            $data['notes'] = null;

            $contact->updateQuietly($data);
            $updated++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Migrated {$updated} contacts.");

        return self::SUCCESS;
    }
}
