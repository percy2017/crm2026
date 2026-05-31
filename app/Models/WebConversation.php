<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WebConversation extends Model
{
    protected $fillable = ['visitor_id', 'widget_id', 'assigned_to', 'status', 'unread_count'];

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(WebVisitor::class);
    }

    public function widget(): BelongsTo
    {
        return $this->belongsTo(WebWidget::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(WebMessage::class);
    }
}
