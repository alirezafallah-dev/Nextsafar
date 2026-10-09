<?php

namespace App\Modules\Search\Adapters;

use App\Core\Contracts\ProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ارائه‌دهنده جستجو با SearchApi (Fallback)
 */
class SearchApiProvider implements ProviderInterface
{
    private string $apiKey;
    private string $baseUrl = 'https://www.searchapi.io/api/v1/search';
    
    public function __construct()
    {
        $this->apiKey = config('services.searchapi.key', '');
    }
    
    public function getName(): string
    {
        return 'searchapi';
    }
    
    public function isAvailable(): bool
    {
        return !empty($this->apiKey);
    }
    
    public function search(array $params): array
    {
        // مشابه SerpApiProvider
        return [];
    }
}
