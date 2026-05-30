<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->string('type')->default('individual')->after('phone');
            $table->string('instance')->nullable()->after('type');
            $table->json('group_jids')->nullable()->after('instance');
            $table->integer('participant_count')->nullable()->after('group_jids');
            $table->boolean('is_community')->default(false)->after('participant_count');
            $table->string('owner')->nullable()->after('is_community');
            $table->timestamp('last_synced_at')->nullable()->after('owner');
            $table->string('phone', 191)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn(['type', 'instance', 'group_jids', 'participant_count', 'is_community', 'owner', 'last_synced_at']);
            $table->string('phone', 191)->nullable(false)->change();
        });
    }
};
