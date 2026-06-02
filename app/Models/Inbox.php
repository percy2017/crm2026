<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inbox extends Model
{
    protected $fillable = [
        'name',
        'type',
        'status',
        'webhook_url',
        'webhook_enabled',
        'config',
        'web_widget_id',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'webhook_enabled' => 'boolean',
        ];
    }

    public function webWidget(): BelongsTo
    {
        return $this->belongsTo(WebWidget::class, 'web_widget_id');
    }
}
