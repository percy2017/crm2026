<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->string('wa_status', 255)->nullable()->after('is_business');
            $table->text('description')->nullable()->after('wa_status');
            $table->json('website')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn(['wa_status', 'description', 'website']);
        });
    }
};
