<?php

use App\Http\Controllers\Web\WidgetController;
use App\Http\Controllers\Webhooks\EvolutionWebhookController;
use App\Http\Middleware\WidgetCors;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/evolution', [EvolutionWebhookController::class, 'handle'])->name('api.webhooks.evolution');

Route::prefix('widget')->middleware(WidgetCors::class)->group(function () {
    Route::get('/config', [WidgetController::class, 'config'])->name('config');
    Route::post('/visitor', [WidgetController::class, 'visitor'])->name('visitor');
    Route::get('/conversations', [WidgetController::class, 'conversations'])->name('conversations');
    Route::post('/conversations', [WidgetController::class, 'createConversation'])->name('conversations.create');
    Route::post('/messages', [WidgetController::class, 'sendMessage'])->name('messages.send');
});
