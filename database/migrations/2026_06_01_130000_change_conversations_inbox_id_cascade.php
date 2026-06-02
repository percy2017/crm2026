<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE conversations ADD CONSTRAINT conversations_inbox_id_foreign FOREIGN KEY (inbox_id) REFERENCES inboxes(id) ON DELETE CASCADE');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE conversations DROP FOREIGN KEY conversations_inbox_id_foreign');
    }
};
