<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CronJob extends Model
{
    protected $fillable = [
        'name',
        'command',
        'arguments',
        'frequency',
        'is_active',
        'timeout',
        'max_runs',
        'run_count',
        'last_run_at',
        'last_result',
        'last_output',
    ];

    protected function casts(): array
    {
        return [
            'arguments' => 'array',
            'is_active' => 'boolean',
            'last_run_at' => 'datetime',
        ];
    }

    public function logs()
    {
        return $this->hasMany(CronJobLog::class);
    }
}
