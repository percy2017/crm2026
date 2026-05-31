<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebMessage extends Model
{
    protected $fillable = ['conversation_id', 'content', 'is_from_visitor'];

    protected function casts(): array
    {
        return [
            'is_from_visitor' => 'boolean',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(WebConversation::class, 'conversation_id');
    }
}
