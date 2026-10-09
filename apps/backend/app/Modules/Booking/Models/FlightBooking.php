<?php

namespace App\Modules\Booking\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FlightBooking extends Model
{
    protected $fillable = [
        'booking_id', 'provider', 'provider_flight_id', 'flight_number',
        'airline', 'airline_code', 'departure_airport', 'departure_city',
        'arrival_airport', 'arrival_city', 'departure_time', 'arrival_time',
        'duration_minutes', 'cabin_class', 'stops', 'pnr_code', 'baggage_kg',
        'trip_type', 'raw_data',
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'arrival_time' => 'datetime',
        'duration_minutes' => 'integer',
        'stops' => 'integer',
        'baggage_kg' => 'integer',
        'raw_data' => 'array',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function getDurationTextAttribute(): string
    {
        if (!$this->duration_minutes) {
            return 'نامشخص';
        }
        $hours = intdiv($this->duration_minutes, 60);
        $minutes = $this->duration_minutes % 60;
        return "{$hours} ساعت و {$minutes} دقیقه";
    }

    public function isDirect(): bool
    {
        return $this->stops === 0;
    }

    public function getRouteAttribute(): string
    {
        return "{$this->departure_airport} → {$this->arrival_airport}";
    }
}
