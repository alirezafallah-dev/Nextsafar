<?php

namespace App\Modules\Search\Adapters;

use App\Core\Contracts\ProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ارائه‌دهنده جستجو با SerpApi
 */
class SerpApiProvider implements ProviderInterface
{
    private string $apiKey;
    private string $baseUrl = 'https://serpapi.com/search.json';
    
    public function __construct()
    {
        $this->apiKey = config('services.serpapi.key', '');
    }
    
    public function getName(): string
    {
        return 'serpapi';
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
                'return_date' => $params['return_date'] ?? null,
                'adults' => $params['adults'] ?? 1,
                'currency' => 'IRR',
                'hl' => 'fa',
            ]);
            
            if ($response->failed()) {
                Log::error('SerpApi flight search failed', [
                    'status' => $response->status(),
                ]);
                return [];
            }
            
            return $this->transformFlightResults($response->json());
            
        } catch (\Throwable $e) {
            Log::error('SerpApi flight search exception', [
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
                Log::error('SerpApi hotel search failed');
                return [];
            }
            
            return $this->transformHotelResults($response->json());
            
        } catch (\Throwable $e) {
            Log::error('SerpApi hotel search exception', [
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
    
    private function transformFlightResults(array $data): array
    {
        $flights = [];
        
        foreach ($data['other_flights'] ?? [] as $flight) {
            $flights[] = [
                'id' => $flight['flight_number'] ?? uniqid(),
                'airline' => $flight['airline'] ?? '',
                'departure' => [
                    'airport' => $flight['departure_airport']['id'] ?? '',
                    'time' => $flight['departure_airport']['time'] ?? '',
                ],
                'arrival' => [
                    'airport' => $flight['arrival_airport']['id'] ?? '',
                    'time' => $flight['arrival_airport']['time'] ?? '',
                ],
                'price' => $flight['price'] ?? 0,
                'currency' => 'IRR',
            ];
        }
        
        return $flights;
    }
    
    private function transformHotelResults(array $data): array
    {
        $hotels = [];
        
        foreach ($data['properties'] ?? [] as $hotel) {
            $hotels[] = [
                'id' => $hotel['property_token'] ?? uniqid(),
                'name' => $hotel['name'] ?? '',
                'rating' => $hotel['overall_rating'] ?? 0,
                'price' => $hotel['price'] ?? 0,
                'currency' => 'IRR',
            ];
        }
        
        return $hotels;
    }
}
