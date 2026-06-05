<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'channel_id',
        'instance',
        'message_id',
        'reaction_to',
        'input_output',
        'message_type',
        'text',
        'media_url',
        'sender_phone',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'input_output' => 'boolean',
            'link_preview' => 'array',
        ];
    }

    public function reactedMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'reaction_to', 'message_id')
            ->where('channel_id', $this->channel_id);
    }
}
