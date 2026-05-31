<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('phone', 191)->nullable()->unique();
            $table->string('whatsapp_id')->nullable();
            $table->string('type')->default('individual');
            $table->string('instance')->nullable();
            $table->json('group_jids')->nullable();
            $table->integer('participant_count')->nullable();
            $table->boolean('is_community')->default(false);
            $table->string('owner')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->string('email')->nullable();
            $table->string('country', 4)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_business')->default(false)->nullable();
            $table->string('profile_pic_url')->nullable();
            $table->string('wa_status', 255)->nullable();
            $table->text('description')->nullable();
            $table->json('website')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
