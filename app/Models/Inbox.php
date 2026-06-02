<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inbox extends Model
{
    protected $fillable = [
        'name',
        'type',
        'status',
        'webhook_url',
        'webhook_enabled',
        'config',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'webhook_enabled' => 'boolean',
        ];
    }

    public function getConfigValue(string $key, mixed $default = null): mixed
    {
        return data_get($this->config, $key, $default);
    }
}
