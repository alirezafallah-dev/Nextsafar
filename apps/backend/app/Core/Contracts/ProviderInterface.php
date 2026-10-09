<?php

namespace App\Core\Contracts;

/**
 * قرارداد پایه برای همه ارائه‌دهندگان خارجی (SerpApi, SearchApi, etc.)
 */
interface ProviderInterface
{
    public function getName(): string;
    
    public function isAvailable(): bool;
    
    public function search(array $params): array;
}
