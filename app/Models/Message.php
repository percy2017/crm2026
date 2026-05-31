<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'channel_id',
        'input_output',
        'message_type',
        'text',
        'media_url',
    ];

    protected function casts(): array
    {
        return [
            'input_output' => 'boolean',
        ];
    }
}
