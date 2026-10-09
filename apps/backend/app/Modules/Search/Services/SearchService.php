<?php

namespace App\Modules\Search\Services;

use App\Core\Services\BaseService;
use App\Modules\Search\Providers\ProviderFactory;

/**
 * سرویس اصلی جستجو
 */
class SearchService extends BaseService
{
    protected function getModuleName(): string
    {
        return 'Search';
    }
    
    public function searchFlights(array $params): array
    {
        $cacheKey = 'flights:' . md5(json_encode($params));
        
        return $this->cacheRemember($cacheKey, function() use ($params) {
            return $this->executeWithFallback('flight', $params);
        }, 300);
    }
    
    public function searchHotels(array $params): array
    {
        $cacheKey = 'hotels:' . md5(json_encode($params));
        
        return $this->cacheRemember($cacheKey, function() use ($params) {
            return $this->executeWithFallback('hotel', $params);
        }, 300);
    }
    
    private function executeWithFallback(string $type, array $params): array
    {
        $providers = ProviderFactory::getAvailable();
        
        foreach ($providers as $provider) {
            try {
                $this->log("Trying {$provider->getName()} for {$type} search");
                
                $result = $provider->search(['type' => $type, ...$params]);
                
                if (!empty($result)) {
                    $this->log("Success with {$provider->getName()}", [
                        'count' => count($result),
                    ]);
                    return $result;
                }
                
            } catch (\Throwable $e) {
                $this->log("Provider {$provider->getName()} failed", [
                    'error' => $e->getMessage(),
                ], 'warning');
                
                continue;
            }
        }
        
        $this->log("All providers failed for {$type} search", [], 'error');
        return [];
    }
}
