<?php

namespace App\Modules\Payment\Enums;

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case REDIRECTING = 'redirecting';
    case SUCCESS = 'success';
    case FAILED = 'failed';
    case CANCELLED = 'cancelled';
    case REFUNDED = 'refunded';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'در انتظار',
            self::REDIRECTING => 'در حال انتقال',
            self::SUCCESS => 'موفق',
            self::FAILED => 'ناموفق',
            self::CANCELLED => 'لغو شده',
            self::REFUNDED => 'مسترد شده',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING => 'gray',
            self::REDIRECTING => 'yellow',
            self::SUCCESS => 'green',
            self::FAILED => 'red',
            self::CANCELLED => 'orange',
            self::REFUNDED => 'purple',
        };
    }

    public function isSuccessful(): bool
    {
        return $this === self::SUCCESS;
    }
}
