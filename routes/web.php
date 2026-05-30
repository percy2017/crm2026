<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('reverb-monitor', 'reverb-monitor')->name('reverb-monitor');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/webhooks.php';
