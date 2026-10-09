<?php

namespace App\Modules\Payment\Enums;

enum PaymentGateway: string
{
    case ZARINPAL = 'zarinpal';
    case IDPAY = 'idpay';
    case WALLET = 'wallet';
    case MANUAL = 'manual';

    public function label(): string
    {
        return match($this) {
            self::ZARINPAL => 'زرین‌پال',
            self::IDPAY => 'آیدی‌پی',
            self::WALLET => 'کیف پول',
            self::MANUAL => 'دستی',
        };
    }

    public function supportsRefund(): bool
    {
        return match($this) {
            self::ZARINPAL, self::IDPAY => true,
            default => false,
        };
    }
}
