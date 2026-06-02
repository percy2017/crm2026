<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use Laravel\Ai\AiServiceProvider;

return [
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    AiServiceProvider::class,
];
