<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CronJobLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'cron_job_id',
        'started_at',
        'finished_at',
        'result',
        'output',
        'duration_ms',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function cronJob()
    {
        return $this->belongsTo(CronJob::class);
    }
}