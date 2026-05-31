<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('web_widgets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('domain');
            $table->string('color', 7)->default('#3b82f6');
            $table->string('position', 5)->default('right');
            $table->string('greeting', 255)->default('Hola, ¿en qué podemos ayudarte?');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('web_visitors', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('ip')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('current_page')->nullable();
            $table->timestamp('first_seen_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
        });

        Schema::create('web_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visitor_id')->constrained('web_visitors')->cascadeOnDelete();
            $table->foreignId('widget_id')->constrained('web_widgets')->cascadeOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('pending');
            $table->unsignedSmallInteger('unread_count')->default(0);
            $table->timestamps();
        });

        Schema::create('web_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('web_conversations')->cascadeOnDelete();
            $table->text('content');
            $table->boolean('is_from_visitor')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('web_messages');
        Schema::dropIfExists('web_conversations');
        Schema::dropIfExists('web_visitors');
        Schema::dropIfExists('web_widgets');
    }
};
