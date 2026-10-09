<?php

namespace App\Modules\Search\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Search\Services\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __construct(
        private SearchService $searchService
    ) {}
    
    /**
     * جستجوی پرواز
     */
    public function searchFlights(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => 'required|string|max:3',
            'to' => 'required|string|max:3',
            'departure_date' => 'required|date',
            'return_date' => 'nullable|date|after_or_equal:departure_date',
            'adults' => 'integer|min:1|max:9',
            'children' => 'integer|min:0|max:9',
        ]);
        
        $results = $this->searchService->searchFlights($validated);
        
        return response()->json([
            'success' => true,
            'data' => $results,
            'meta' => [
                'count' => count($results),
                'searched_at' => now()->toIso8601String(),
            ],
        ]);
    }
    
    /**
     * جستجوی هتل
     */
    public function searchHotels(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|max:255',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'adults' => 'integer|min:1|max:9',
            'children' => 'integer|min:0|max:9',
        ]);
        
        $results = $this->searchService->searchHotels($validated);
        
        return response()->json([
            'success' => true,
            'data' => $results,
            'meta' => [
                'count' => count($results),
                'searched_at' => now()->toIso8601String(),
            ],
        ]);
    }
}
