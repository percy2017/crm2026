<?php

namespace App\Console\Commands;

use App\Models\Contact;
use Illuminate\Console\Command;

class DetectCountries extends Command
{
    protected $signature = 'contacts:detect-countries';

    protected $description = 'Detect country from phone numbers for existing contacts';

    public function handle(): int
    {
        $contacts = Contact::whereNotNull('phone')
            ->whereNull('country')
            ->get();

        $bar = $this->output->createProgressBar($contacts->count());
        $bar->start();

        $updated = 0;

        foreach ($contacts as $contact) {
            $country = Contact::detectCountry($contact->phone);
            if ($country) {
                $contact->updateQuietly(['country' => $country]);
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
