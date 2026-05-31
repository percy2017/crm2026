<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WebVisitor extends Model
{
    protected $fillable = [
        'uuid', 'name', 'email', 'phone', 'ip',
        'user_agent', 'current_page', 'first_seen_at', 'last_seen_at',
    ];

    public function conversations(): HasMany
    {
        return $this->hasMany(WebConversation::class);
    }
}
