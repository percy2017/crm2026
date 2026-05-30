<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvolutionWebhook extends Model
{
    protected $table = 'evolution_webhooks';

    protected $fillable = [
        'instance',
        'event',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }
}
