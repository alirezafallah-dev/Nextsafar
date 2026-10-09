<?php

namespace App\Modules\Booking\Models;

use App\Modules\Booking\Enums\PassengerType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookingPassenger extends Model
{
    protected $fillable = [
        'booking_id', 'passenger_type', 'title', 'first_name', 'middle_name',
        'last_name', 'first_name_fa', 'last_name_fa', 'national_id',
        'passport_number', 'passport_expiry', 'passport_country', 'birth_date',
        'gender', 'nationality', 'email', 'phone', 'seat_preference',
        'meal_preference', 'special_requests', 'price_paid',
    ];

    protected $casts = [
        'passenger_type' => PassengerType::class,
        'birth_date' => 'date',
        'passport_expiry' => 'date',
        'price_paid' => 'decimal:2',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(BookingDocument::class, 'passenger_id');
    }

    public function getFullNameAttribute(): string
    {
        $parts = array_filter([
            $this->title,
            $this->first_name,
            $this->middle_name,
            $this->last_name,
        ]);
        return implode(' ', $parts);
    }

    public function getFullNameFaAttribute(): string
    {
        $parts = array_filter([
            $this->first_name_fa,
            $this->last_name_fa,
        ]);
        return implode(' ', $parts);
    }

    public function getAgeAttribute(): ?int
    {
        if (!$this->birth_date) {
            return null;
        }
        return $this->birth_date->diffInYears(now());
    }

    public function hasValidPassport(): bool
    {
        if (!$this->passport_number || !$this->passport_expiry) {
            return false;
        }
        return $this->passport_expiry->isFuture();
    }
}
