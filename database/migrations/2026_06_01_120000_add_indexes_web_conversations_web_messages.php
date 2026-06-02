<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('web_conversations', function (Blueprint $table) {
            $table->index(['visitor_id', 'status']);
            $table->index('status');
        });

        Schema::table('web_messages', function (Blueprint $table) {
            $table->index('conversation_id');
        });
    }

    public function down(): void
    {
        Schema::table('web_conversations', function (Blueprint $table) {
            $table->dropIndex(['visitor_id', 'status']);
            $table->dropIndex('status');
        });

        Schema::table('web_messages', function (Blueprint $table) {
            $table->dropIndex('conversation_id');
        });
    }
};
