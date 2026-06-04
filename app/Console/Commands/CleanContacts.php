<?php

namespace App\Console\Commands;

use App\Models\Contact;
use Illuminate\Console\Command;

class CleanContacts extends Command
{
    protected $signature = 'contacts:clean';

    protected $description = 'Remove contacts created from invalid identifiers';

    public function handle(): int
    {
        $deleted = Contact::where('type', 'individual')
            ->where(function ($q) {
                $q->whereNull('phone')
                    ->orWhere('phone', '')
                    ->orWhere('phone', 'like', '%@%');
            })
            ->delete();

        $this->info("Deleted {$deleted} invalid contacts.");

        return 0;
    }
}
