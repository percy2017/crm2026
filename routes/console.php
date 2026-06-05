<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('inbox:health-check')->everyMinute()->withoutOverlapping(5)->runInBackground();
Schedule::command('app:generate-link-previews')->everyMinute()->withoutOverlapping(5)->runInBackground();
