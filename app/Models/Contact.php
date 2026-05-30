<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use libphonenumber\PhoneNumberUtil;

class Contact extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'whatsapp_id',
        'email',
        'notes',
        'profile_pic_url',
        'is_active',
        'is_business',
        'wa_status',
        'description',
        'website',
        'country',
        'type',
        'instance',
        'group_jids',
        'participant_count',
        'is_community',
        'owner',
        'last_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_business' => 'boolean',
            'is_community' => 'boolean',
            'group_jids' => 'array',
            'website' => 'array',
            'last_synced_at' => 'datetime',
        ];
    }

    public function scopeIndividuals(Builder $query): Builder
    {
        return $query->where('type', 'individual');
    }

    public function scopeGroups(Builder $query): Builder
    {
        return $query->where('type', 'group');
    }

    public function groupContacts(): Builder
    {
        return Contact::where('type', 'group')
            ->whereIn('whatsapp_id', $this->group_jids ?? []);
    }

    public function members(): Builder
    {
        return Contact::where('type', 'individual')
            ->whereJsonContains('group_jids', $this->whatsapp_id);
    }

    public static function detectCountry(?string $phone): ?string
    {
        if (empty($phone)) {
            return null;
        }

        try {
            $normalized = str_starts_with($phone, '+') ? $phone : "+{$phone}";
            $util = PhoneNumberUtil::getInstance();
            $number = $util->parse($normalized);

            if ($util->isValidNumber($number)) {
                return $util->getRegionCodeForNumber($number);
            }
        } catch (\Exception) {
            // ignore
        }

        return null;
    }

    protected static function booted(): void
    {
        static::saving(function (self $contact) {
            if ($contact->isDirty('phone') && ! $contact->isDirty('country')) {
                $country = self::detectCountry($contact->phone);
                if ($country) {
                    $contact->country = $country;
                }
            }
        });
    }
}
