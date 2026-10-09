<?php

namespace App\Modules\Booking\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelBooking extends Model
{
    protected $fillable = [
        'booking_id', 'provider', 'property_token', 'provider_property_id',
        'hotel_name', 'city', 'address', 'star_rating', 'room_type',
        'room_count', 'check_in', 'check_out', 'nights', 'adults',
        'children', 'confirmation_code', 'raw_data',
    ];

    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'nights' => 'integer',
        'adults' => 'integer',
        'children' => 'integer',
        'room_count' => 'integer',
        'star_rating' => 'integer',
        'raw_data' => 'array',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function getTotalGuestsAttribute(): int
    {
        return $this->adults + $this->children;
    }

    public function getStarRatingTextAttribute(): string
    {
        return str_repeat('⭐', $this->star_rating ?? 0);
    }
}
