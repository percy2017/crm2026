<?php

namespace App\Console\Commands;

use App\Models\Contact;
use Illuminate\Console\Command;

class DetectBusiness extends Command
{
    protected $signature = 'contacts:detect-business';

    protected $description = 'Parse isBusiness from notes JSON for existing contacts';

    public function handle(): int
    {
        $contacts = Contact::whereNotNull('notes')
            ->where('notes', 'like', '%isBusiness%')
            ->get();

        $bar = $this->output->createProgressBar($contacts->count());
        $bar->start();

        $updated = 0;

        foreach ($contacts as $contact) {
            $parsed = json_decode($contact->notes, true);
            if (isset($parsed['isBusiness'])) {
                $contact->updateQuietly(['is_business' => (bool) $parsed['isBusiness']]);
                $updated++;
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Updated {$updated} contacts.");

        return self::SUCCESS;
    }
}
