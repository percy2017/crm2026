<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CronJob;
use App\Models\CronJobLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class AdminCronJobController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/cron-jobs/index');
    }

    public function list(): JsonResponse
    {
        return response()->json(
            CronJob::orderBy('name')->get()->map(fn ($job) => [
                'id' => $job->id,
                'name' => $job->name,
                'command' => $job->command,
                'arguments' => $job->arguments,
                'frequency' => $job->frequency,
                'is_active' => $job->is_active,
                'timeout' => $job->timeout,
                'max_runs' => $job->max_runs,
                'run_count' => $job->run_count,
                'last_run_at' => $job->last_run_at?->toDateTimeString(),
                'last_result' => $job->last_result,
                'last_output' => $job->last_output,
                'created_at' => $job->created_at->toDateTimeString(),
            ])
        );
    }

    public function commands(): JsonResponse
    {
        $commands = [];
        foreach (Artisan::all() as $name => $command) {
            if ($command->getDescription() && ! str_starts_with($name, 'vendor:')) {
                $commands[] = [
                    'name' => $name,
                    'description' => $command->getDescription(),
                ];
            }
        }
        usort($commands, fn ($a, $b) => $a['name'] <=> $b['name']);

        return response()->json($commands);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'command' => 'required|string|max:200',
            'arguments' => 'nullable|json',
            'frequency' => 'required|string|max:50',
            'timeout' => 'nullable|integer|min:0',
            'max_runs' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $data = $request->only(['name', 'command', 'frequency']);
        $data['arguments'] = $request->input('arguments') ? json_decode($request->input('arguments'), true) : null;
        $data['timeout'] = $request->input('timeout', 0);
        $data['max_runs'] = $request->input('max_runs');
        $data['is_active'] = $request->boolean('is_active', true);

        $job = CronJob::create($data);

        return response()->json($job, 201);
    }

    public function update(Request $request, CronJob $cronJob): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'command' => 'required|string|max:200',
            'arguments' => 'nullable|json',
            'frequency' => 'required|string|max:50',
            'timeout' => 'nullable|integer|min:0',
            'max_runs' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $data = $request->only(['name', 'command', 'frequency']);
        $data['arguments'] = $request->input('arguments') ? json_decode($request->input('arguments'), true) : null;
        $data['timeout'] = $request->input('timeout', 0);
        $data['max_runs'] = $request->input('max_runs');
        $data['is_active'] = $request->boolean('is_active', true);

        $cronJob->update($data);

        return response()->json($cronJob);
    }

    public function destroy(CronJob $cronJob): JsonResponse
    {
        $cronJob->logs()->delete();
        $cronJob->delete();

        return response()->json(['deleted' => true]);
    }

    public function toggle(CronJob $cronJob): JsonResponse
    {
        $cronJob->update(['is_active' => ! $cronJob->is_active]);

        return response()->json(['is_active' => $cronJob->fresh()->is_active]);
    }

    public function runNow(CronJob $cronJob): JsonResponse
    {
        $start = microtime(true);
        $startedAt = now();

        $params = $cronJob->arguments ?? [];
        $exitCode = Artisan::call($cronJob->command, $params);
        $output = Artisan::output();

        $duration = (int) ((microtime(true) - $start) * 1000);

        $result = $exitCode === 0 ? 'success' : 'failed';

        CronJobLog::create([
            'cron_job_id' => $cronJob->id,
            'started_at' => $startedAt,
            'finished_at' => now(),
            'result' => $result,
            'output' => $output,
            'duration_ms' => $duration,
        ]);

        $cronJob->update([
            'last_run_at' => $startedAt,
            'last_result' => $result,
            'last_output' => $output,
            'run_count' => $cronJob->run_count + 1,
        ]);

        return response()->json([
            'result' => $result,
            'output' => $output,
            'duration_ms' => $duration,
        ]);
    }

    public function logs(CronJob $cronJob): JsonResponse
    {
        $limit = request()->input('limit', 50);

        return response()->json(
            $cronJob->logs()
                ->orderBy('started_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(fn (CronJobLog $log) => [
                    'id' => $log->id,
                    'started_at' => $log->started_at->toDateTimeString(),
                    'finished_at' => $log->finished_at?->toDateTimeString(),
                    'result' => $log->result,
                    'output' => $log->output,
                    'duration_ms' => $log->duration_ms,
                ])
        );
    }
}