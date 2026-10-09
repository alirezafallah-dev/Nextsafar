<?php

namespace App\Modules\Booking\Enums;

enum BookingType: string
{
    case FLIGHT = 'flight';
    case HOTEL = 'hotel';
    case TOUR = 'tour';
    case VISA = 'visa';

    public function label(): string
    {
        return match($this) {
            self::FLIGHT => 'پرواز',
            self::HOTEL => 'هتل',
            self::TOUR => 'تور',
            self::VISA => 'ویزا',
        };
    }

    public function icon(): string
    {
        return match($this) {
            self::FLIGHT => '✈️',
            self::HOTEL => '🏨',
            self::TOUR => '🌍',
            self::VISA => '🛂',
        };
    }

    /**
     * آیا این نوع رزرو نیاز به پرداخت آنلاین دارد؟
     */
    public function requiresPayment(): bool
    {
        return match($this) {
            self::VISA => true,
            default => false, // فعلاً فقط ویزا
        };
    }

    /**
     * آیا این نوع رزرو از وردپرس خوانده می‌شود؟
     */
    public function isFromWordPress(): bool
    {
        return match($this) {
            self::TOUR, self::VISA => true,
            default => false,
        };
    }
}
