<?php

namespace App\Console\Commands;

use App\Models\CronJob;
use App\Models\CronJobLog;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class CronJobRunner extends Command
{
    protected $signature = 'cron:runner';

    protected $description = 'Execute scheduled cron jobs from database';

    public function handle(): int
    {
        $jobs = CronJob::where('is_active', true)->get();

        foreach ($jobs as $job) {
            if (! $this->shouldRun($job)) {
                continue;
            }

            if ($job->max_runs !== null && $job->run_count >= $job->max_runs) {
                $job->update(['is_active' => false]);
                continue;
            }

            $start = microtime(true);
            $startedAt = now();

            $params = $job->arguments ?? [];
            $exitCode = Artisan::call($job->command, $params);
            $output = Artisan::output();

            $duration = (int) ((microtime(true) - $start) * 1000);
            $result = $exitCode === 0 ? 'success' : 'failed';

            CronJobLog::create([
                'cron_job_id' => $job->id,
                'started_at' => $startedAt,
                'finished_at' => now(),
                'result' => $result,
                'output' => $output,
                'duration_ms' => $duration,
            ]);

            CronJob::where('id', $job->id)->where('run_count', $job->run_count)->update([
                'last_run_at' => $startedAt,
                'last_result' => $result,
                'last_output' => $output,
                'run_count' => $job->run_count + 1,
            ]);

            CronJobLog::where('cron_job_id', $job->id)
                ->orderBy('started_at', 'desc')
                ->skip(100)
                ->take(PHP_INT_MAX)
                ->delete();
        }

        return 0;
    }

    private function shouldRun(CronJob $job): bool
    {
        $lastRun = $job->last_run_at;

        return match ($job->frequency) {
            'everyMinute' => $lastRun === null || $lastRun->diffInMinutes(now()) >= 1,
            'everyFiveMinutes' => $lastRun === null || $lastRun->diffInMinutes(now()) >= 5,
            'everyTenMinutes' => $lastRun === null || $lastRun->diffInMinutes(now()) >= 10,
            'everyFifteenMinutes' => $lastRun === null || $lastRun->diffInMinutes(now()) >= 15,
            'everyThirtyMinutes' => $lastRun === null || $lastRun->diffInMinutes(now()) >= 30,
            'hourly' => $lastRun === null || $lastRun->diffInHours(now()) >= 1,
            'everyTwoHours' => $lastRun === null || $lastRun->diffInHours(now()) >= 2,
            'everySixHours' => $lastRun === null || $lastRun->diffInHours(now()) >= 6,
            'daily' => $lastRun === null || ! $lastRun->isToday(),
            'dailyAt:00:00' => $lastRun === null || ! $lastRun->isToday(),
            'weekly' => $lastRun === null || $lastRun->diffInWeeks(now()) >= 1,
            'monthly' => $lastRun === null || $lastRun->diffInMonths(now()) >= 1,
            default => true,
        };
    }
}