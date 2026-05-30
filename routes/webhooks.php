<?php

use App\Http\Controllers\Webhooks\EvolutionWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('webhooks/evolution', [EvolutionWebhookController::class, 'handle'])->name('webhooks.evolution');
