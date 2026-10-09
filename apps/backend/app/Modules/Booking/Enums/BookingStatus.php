<?php

namespace App\Modules\Booking\Enums;

enum BookingStatus: string
{
    case PENDING = 'pending';                    // در انتظار
    case AWAITING_PAYMENT = 'awaiting_payment';  // در انتظار پرداخت
    case PAID = 'paid';                          // پرداخت شده
    case PROCESSING = 'processing';              // در حال پردازش
    case CONFIRMED = 'confirmed';                // تایید شده
    case COMPLETED = 'completed';                // تکمیل شده
    case CANCELLED = 'cancelled';                // لغو شده
    case REFUNDED = 'refunded';                  // مسترد شده
    case FAILED = 'failed';                      // ناموفق

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'در انتظار',
            self::AWAITING_PAYMENT => 'در انتظار پرداخت',
            self::PAID => 'پرداخت شده',
            self::PROCESSING => 'در حال پردازش',
            self::CONFIRMED => 'تایید شده',
            self::COMPLETED => 'تکمیل شده',
            self::CANCELLED => 'لغو شده',
            self::REFUNDED => 'مسترد شده',
            self::FAILED => 'ناموفق',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING => 'gray',
            self::AWAITING_PAYMENT => 'yellow',
            self::PAID => 'blue',
            self::PROCESSING => 'orange',
            self::CONFIRMED => 'green',
            self::COMPLETED => 'green',
            self::CANCELLED => 'red',
            self::REFUNDED => 'purple',
            self::FAILED => 'red',
        };
    }

    /**
     * آیا این وضعیت نهایی است؟
     */
    public function isFinal(): bool
    {
        return in_array($this, [
            self::COMPLETED,
            self::CANCELLED,
            self::REFUNDED,
            self::FAILED,
        ]);
    }
}
