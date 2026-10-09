<?php

namespace App\Modules\Booking\Enums;

enum PassengerType: string
{
    case ADULT = 'adult';
    case CHILD = 'child';
    case INFANT = 'infant';

    public function label(): string
    {
        return match($this) {
            self::ADULT => 'بزرگسال',
            self::CHILD => 'کودک',
            self::INFANT => 'نوزاد',
        };
    }

    /**
     * ضریب قیمت بر اساس نوع مسافر
     */
    public function priceMultiplier(): float
    {
        return match($this) {
            self::ADULT => 1.0,
            self::CHILD => 0.7,   // 70% قیمت بزرگسال
            self::INFANT => 0.1,  // 10% قیمت بزرگسال
        };
    }
}
