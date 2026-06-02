<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('message_id')->nullable();
            $table->string('channel_id')->index();
            $table->string('instance')->nullable()->index();
            $table->boolean('input_output');
            $table->string('message_type')->nullable();
            $table->text('text')->nullable();
            $table->string('media_url')->nullable();
            $table->string('sender_phone')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
