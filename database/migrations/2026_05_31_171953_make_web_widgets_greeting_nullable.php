<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('web_widgets', function (Blueprint $table) {
            $table->string('greeting', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('web_widgets', function (Blueprint $table) {
            $table->string('greeting', 255)->default('Hola, ¿en qué podemos ayudarte?')->nullable(false)->change();
        });
    }
};
