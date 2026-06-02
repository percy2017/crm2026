<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inbox_id')->nullable()->constrained('inboxes')->cascadeOnDelete();
            $table->string('channel_id');
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->string('instance')->nullable()->index();
            $table->unsignedSmallInteger('unread_count')->default(0);
            $table->string('status', 20)->default('active');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['channel_id', 'instance']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
