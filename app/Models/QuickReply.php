<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuickReply extends Model
{
    protected $fillable = [
        'shortcut',
        'message',
        'media_url',
        'media_type',
    ];
}
