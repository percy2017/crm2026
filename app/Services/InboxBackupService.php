<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Inbox;
use App\Models\Message;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class InboxBackupService
{
    public function backup(string $instance): string
    {
        $inbox = Inbox::where('name', $instance)->firstOrFail();

        $timestamp = now()->format('Ymd_His');
        $zipName = "backup-{$instance}-{$timestamp}.zip";
        $zipPath = storage_path("app/backups/{$zipName}");

        if (! is_dir(dirname($zipPath))) {
            mkdir(dirname($zipPath), 0755, true);
        }

        $zip = new ZipArchive;

        if ($zip->open($zipPath, ZipArchive::CREATE) !== true) {
            throw new \RuntimeException("Failed to create ZIP at {$zipPath}");
        }

        // 1. inbox.json
        $zip->addFromString('inbox.json', json_encode(
            $inbox->toArray(),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        ));

        // 2. conversations.json (chunked)
        $conversations = Conversation::where('instance', $instance)
            ->with('contact')
            ->get()
            ->toArray();

        $zip->addFromString('conversations.json', json_encode(
            $conversations,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        ));

        // 3. contacts.json (unique contacts from conversations)
        $contactIds = Conversation::where('instance', $instance)
            ->whereNotNull('contact_id')
            ->pluck('contact_id')
            ->unique();

        $contacts = Contact::whereIn('id', $contactIds)->get()->toArray();

        $zip->addFromString('contacts.json', json_encode(
            $contacts,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        ));

        // 4. messages.json (chunked to avoid memory issues)
        $messagesFile = tmpfile();
        $messagesPath = stream_get_meta_data($messagesFile)['uri'];
        $messagesHandle = fopen($messagesPath, 'w');
        fwrite($messagesHandle, "[\n");

        Message::where('instance', $instance)
            ->orderBy('id')
            ->chunk(500, function ($chunk, $index) use ($messagesHandle) {
                if ($index > 0) {
                    fwrite($messagesHandle, ",\n");
                }

                $json = json_encode($chunk->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                fwrite($messagesHandle, substr($json, 1, -1));
            });

        fwrite($messagesHandle, "\n]\n");
        fclose($messagesHandle);
        $zip->addFile($messagesPath, 'messages.json');

        // 5. media files
        $mediaFiles = Message::where('instance', $instance)
            ->whereNotNull('media_url')
            ->pluck('media_url')
            ->unique()
            ->filter();

        foreach ($mediaFiles as $mediaUrl) {
            $mediaPath = Storage::disk('public')->path($mediaUrl);

            if (file_exists($mediaPath)) {
                $zip->addFile($mediaPath, "media/{$mediaUrl}");
            } else {
                $zip->addFromString("media/_missing_{$mediaUrl}", '');
            }
        }

        // 6. manifest.json
        $manifest = [
            'inbox' => $instance,
            'created_at' => now()->toISOString(),
            'total_conversations' => count($conversations),
            'total_contacts' => count($contacts),
            'total_messages' => Message::where('instance', $instance)->count(),
            'total_media' => $mediaFiles->count(),
        ];

        $zip->addFromString('manifest.json', json_encode(
            $manifest,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
        ));

        $zip->close();

        return $zipName;
    }

    public function listBackups(): array
    {
        $pattern = storage_path('app/backups/backup-*.zip');
        $files = glob($pattern);

        $backups = [];

        foreach ($files as $path) {
            $filename = basename($path);
            preg_match('/^backup-(.+)-(\d{8}_\d{6})\.zip$/', $filename, $matches);

            $backups[] = [
                'filename' => $filename,
                'inbox' => $matches[1] ?? 'unknown',
                'created_at' => $matches[2] ?? null,
                'size' => filesize($path),
                'size_formatted' => $this->formatBytes(filesize($path)),
            ];
        }

        rsort($backups);

        return $backups;
    }

    public function deleteBackup(string $filename): bool
    {
        $path = storage_path("app/backups/{$filename}");

        if (file_exists($path)) {
            return unlink($path);
        }

        return false;
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 1).' '.$units[$i];
    }
}
