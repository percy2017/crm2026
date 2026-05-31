<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Database\Seeder;

class EntradasTestSeeder extends Seeder
{
    public function run(): void
    {
        $contacts = Contact::where('type', 'individual')
            ->whereNotNull('phone')
            ->get();

        $bar = $this->command->getOutput()->createProgressBar($contacts->count());
        $bar->start();

        $messageTypes = [
            'conversation',
            'extendedTextMessage',
            'imageMessage',
            'audioMessage',
            'documentMessage',
        ];

        foreach ($contacts as $contact) {
            $channelId = $contact->whatsapp_id ?? $contact->phone . '@s.whatsapp.net';
            $instance = $contact->instance ?? fake()->randomElement(['entel1', 'tigo1', 'viva1']);

            Conversation::firstOrCreate(
                ['channel_id' => $channelId],
                ['contact_id' => $contact->id, 'instance' => $instance]
            );

            $messageCount = rand(15, 40);
            for ($i = 0; $i < $messageCount; $i++) {
                $isImage = $messageTypes[rand(0, 4)] === 'imageMessage';
                $messageType = $isImage ? 'imageMessage' : fake()->randomElement($messageTypes);

                Message::create([
                    'channel_id' => $channelId,
                    'input_output' => $i % 2 === 0,
                    'message_type' => $messageType,
                    'text' => $messageType === 'imageMessage' ? fake()->optional(0.7)->sentence() : fake()->sentence(rand(5, 25)),
                    'media_url' => $isImage ? 'seeder-placeholder.png' : null,
                    'created_at' => now()->subHours($messageCount - $i)->subMinutes(rand(0, 59)),
                ]);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->command->newLine();
        $this->command->info('Created conversations with messages for ' . $contacts->count() . ' contacts.');
    }
}
