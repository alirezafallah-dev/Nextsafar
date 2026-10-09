<?php

namespace App\Modules\Payment\Gateways;

/**
 * قرارداد پایه برای همه درگاه‌های پرداخت
 */
interface GatewayInterface
{
    /**
     * نام درگاه
     */
    public function getName(): string;

    /**
     * ایجاد تراکنش و دریافت URL پرداخت
     */
    public function purchase(float $amount, string $description, array $metadata = []): array;

    /**
     * تایید پرداخت بعد از بازگشت از درگاه
     */
    public function verify(string $authority, float $expectedAmount): array;

    /**
     * استرداد وجه
     */
    public function refund(string $referenceId, float $amount): array;

    /**
     * بررسی وضعیت تراکنش
     */
    public function inquiry(string $referenceId): array;
}
