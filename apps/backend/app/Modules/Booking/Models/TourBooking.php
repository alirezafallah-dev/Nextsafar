<?php

namespace App\Modules\Booking\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourBooking extends Model
{
    protected $fillable = [
        'booking_id', 'wordpress_post_id', 'tour_title', 'tour_slug',
        'destination', 'departure_date', 'duration_days', 'duration_nights',
        'adults', 'children', 'confirmation_code', 'tour_data',
    ];

    protected $casts = [
        'departure_date' => 'date',
        'duration_days' => 'integer',
        'duration_nights' => 'integer',
        'adults' => 'integer',
        'children' => 'integer',
        'tour_data' => 'array',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function getWordpressUrlAttribute(): string
    {
        $base = rtrim(config('services.wordpress.url', 'http://cms.nextsafar.local'), '/');
        return $this->tour_slug ? "{$base}/tour/{$this->tour_slug}/" : '';
    }

    public function getDurationTextAttribute(): string
    {
        if (!$this->duration_days) {
            return 'نامشخص';
        }
        $days = $this->duration_days;
        $nights = $this->duration_nights ?? ($days - 1);
        return "{$days} روز و {$nights} شب";
    }
}
