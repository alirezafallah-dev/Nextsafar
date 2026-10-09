<?php

namespace App\Modules\Booking\Enums;

enum VisaStatus: string
{
    case DRAFT = 'draft';              // پیش‌نویس
    case SUBMITTED = 'submitted';      // ارسال شده
    case IN_REVIEW = 'in_review';      // در حال بررسی
    case APPROVED = 'approved';        // تایید شده
    case REJECTED = 'rejected';        // رد شده
    case ISSUED = 'issued';            // صادر شده

    public function label(): string
    {
        return match($this) {
            self::DRAFT => 'پیش‌نویس',
            self::SUBMITTED => 'ارسال شده',
            self::IN_REVIEW => 'در حال بررسی',
            self::APPROVED => 'تایید شده',
            self::REJECTED => 'رد شده',
            self::ISSUED => 'صادر شده',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::DRAFT => 'gray',
            self::SUBMITTED => 'blue',
            self::IN_REVIEW => 'yellow',
            self::APPROVED => 'green',
            self::REJECTED => 'red',
            self::ISSUED => 'green',
        };
    }
}
