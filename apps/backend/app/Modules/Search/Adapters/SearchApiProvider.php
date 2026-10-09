<?php

namespace App\Modules\Search\Adapters;

use App\Core\Contracts\ProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ارائه‌دهنده جستجو با SearchApi (Fallback)
 * انتقال یافته از پلاگین وردپرس
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
    
    public function searchFlights(array $params): array
    {
        try {
            $response = Http::timeout(30)->get($this->baseUrl, [
                'engine' => 'google_flights',
                'api_key' => $this->apiKey,
                'departure_id' => $params['from'] ?? '',
                'arrival_id' => $params['to'] ?? '',
                'outbound_date' => $params['departure_date'] ?? '',
                'adults' => $params['adults'] ?? 1,
                'currency' => 'IRR',
                'hl' => 'fa',
            ]);
            
            if ($response->failed()) {
                return [];
            }
            
            return $this->transformResults($response->json());
            
        } catch (\Throwable $e) {
            Log::error('SearchApi flight search exception', [
                'message' => $e->getMessage(),
            ]);
            return [];
        }
    }
    
    public function searchHotels(array $params): array
    {
        try {
            $response = Http::timeout(30)->get($this->baseUrl, [
                'engine' => 'google_hotels',
                'api_key' => $this->apiKey,
                'q' => $params['query'] ?? '',
                'check_in_date' => $params['check_in'] ?? '',
                'check_out_date' => $params['check_out'] ?? '',
                'adults' => $params['adults'] ?? 2,
                'currency' => 'IRR',
                'hl' => 'fa',
            ]);
            
            if ($response->failed()) {
                return [];
            }
            
            return $this->transformResults($response->json());
            
        } catch (\Throwable $e) {
            Log::error('SearchApi hotel search exception', [
                'message' => $e->getMessage(),
            ]);
            return [];
        }
    }
    
    public function search(array $params): array
    {
        $type = $params['type'] ?? 'general';
        
        return match($type) {
            'flight' => $this->searchFlights($params),
            'hotel' => $this->searchHotels($params),
            default => [],
        };
    }
    
    private function transformResults(array $data): array
    {
        // مشابه SerpApiProvider
        return [];
    }
}
