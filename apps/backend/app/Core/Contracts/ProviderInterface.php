<?php

namespace App\Core\Contracts;

/**
 * قرارداد پایه برای همه ارائه‌دهندگان خارجی
 */
interface ProviderInterface
{
    public function getName(): string;
    
    public function isAvailable(): bool;
    
    public function search(array $params): array;
}
