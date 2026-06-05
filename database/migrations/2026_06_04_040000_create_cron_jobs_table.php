<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cron_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('command', 200);
            $table->json('arguments')->nullable();
            $table->string('frequency', 50)->default('everyMinute');
            $table->boolean('is_active')->default(true);
            $table->integer('timeout')->default(0);
            $table->integer('max_runs')->nullable();
            $table->integer('run_count')->default(0);
            $table->timestamp('last_run_at')->nullable();
            $table->string('last_result', 20)->nullable();
            $table->text('last_output')->nullable();
            $table->timestamps();
        });

        Schema::create('cron_job_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cron_job_id')->constrained()->cascadeOnDelete();
            $table->timestamp('started_at');
            $table->timestamp('finished_at')->nullable();
            $table->string('result', 20);
            $table->text('output')->nullable();
            $table->integer('duration_ms')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cron_job_logs');
        Schema::dropIfExists('cron_jobs');
    }
};