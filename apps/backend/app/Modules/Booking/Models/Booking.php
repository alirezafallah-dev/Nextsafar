<?php

namespace App\Modules\Booking\Models;

use App\Models\User;
use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Booking\Enums\BookingType;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\Refund;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    protected $fillable = [
        'booking_code', 'user_id', 'booking_type', 'item_source', 'item_id',
        'item_title', 'status', 'total_amount', 'currency', 'discount_amount',
        'coupon_code', 'passenger_count', 'booking_data', 'pricing_breakdown',
        'cancellation_policy', 'payment_status', 'paid_at', 'notes', 'admin_notes',
        'confirmed_at', 'cancelled_at', 'cancelled_by', 'cancellation_reason',
    ];

    protected $casts = [
        'booking_type' => BookingType::class,
        'status' => BookingStatus::class,
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'passenger_count' => 'integer',
        'booking_data' => 'array',
        'pricing_breakdown' => 'array',
        'cancellation_policy' => 'array',
        'paid_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'pending',
        'item_source' => 'internal',
        'currency' => 'IRR',
    ];

    public static function generateBookingCode(BookingType $type): string
    {
        $prefix = match($type) {
            BookingType::FLIGHT => 'F',
            BookingType::HOTEL => 'H',
            BookingType::TOUR => 'T',
            BookingType::VISA => 'V',
        };

        do {
            $code = 'NS-' . $prefix . '-' . date('ymd') . '-' . strtoupper(substr(md5(uniqid((string) mt_rand(), true)), 0, 6));
        } while (self::where('booking_code', $code)->exists());

        return $code;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function passengers(): HasMany
    {
        return $this->hasMany(BookingPassenger::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(BookingDocument::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function flightDetails(): HasOne
    {
        return $this->hasOne(FlightBooking::class);
    }

    public function hotelDetails(): HasOne
    {
        return $this->hasOne(HotelBooking::class);
    }

    public function tourDetails(): HasOne
    {
        return $this->hasOne(TourBooking::class);
    }

    public function visaDetails(): HasOne
    {
        return $this->hasOne(VisaBooking::class);
    }

    public function getDetails(): ?Model
    {
        return match($this->booking_type) {
            BookingType::FLIGHT => $this->flightDetails,
            BookingType::HOTEL => $this->hotelDetails,
            BookingType::TOUR => $this->tourDetails,
            BookingType::VISA => $this->visaDetails,
            default => null,
        };
    }

    public function isPaid(): bool
    {
        return in_array($this->status, [
            BookingStatus::PAID,
            BookingStatus::CONFIRMED,
            BookingStatus::COMPLETED,
        ]);
    }

    public function isFinal(): bool
    {
        return $this->status->isFinal();
    }

    public function isCancellable(): bool
    {
        return !$this->isFinal() && $this->status !== BookingStatus::CANCELLED;
    }

    public function changeStatus(BookingStatus $newStatus, array $meta = []): bool
    {
        $update = ['status' => $newStatus];

        if ($newStatus === BookingStatus::CONFIRMED) {
            $update['confirmed_at'] = now();
        }

        if ($newStatus === BookingStatus::CANCELLED) {
            $update['cancelled_at'] = now();
            if (isset($meta['reason'])) {
                $update['cancellation_reason'] = $meta['reason'];
            }
        }

        return $this->update($update);
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function (Booking $booking) {
            if (empty($booking->booking_code)) {
                $booking->booking_code = self::generateBookingCode($booking->booking_type);
            }
        });
    }
}
