<?php

namespace App\Modules\WordPress\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WordPress\Services\TourService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TourController extends Controller
{
    public function __construct(
        private TourService $tourService
    ) {}

    /**
     * لیست تورها
     * GET /api/tours
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['category', 'search', 'orderby', 'order']);
        $page = (int) $request->input('page', 1);
        $perPage = min((int) $request->input('per_page', 20), 100);

        $result = $this->tourService->getTours($filters, $page, $perPage);

        return response()->json([
            'success' => true,
            'data' => $result['items'],
            'meta' => [
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'total' => $result['total'],
            ],
        ]);
    }

    /**
     * جزئیات تور
     * GET /api/tours/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $tour = $this->tourService->getTourBySlug($slug);

        if (!$tour) {
            return response()->json([
                'success' => false,
                'error' => 'not_found',
                'message' => 'تور مورد نظر یافت نشد',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $tour,
        ]);
    }

    /**
     * تورهای پیشنهادی
     * GET /api/tours/featured/list
     */
    public function featured(Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 8), 20);
        $tours = $this->tourService->getFeaturedTours($limit);

        return response()->json([
            'success' => true,
            'data' => $tours,
        ]);
    }

    /**
     * جستجوی تورها
     * GET /api/tours/search
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $result = $this->tourService->searchTours(
            $validated['q'],
            (int) ($validated['per_page'] ?? 20)
        );

        return response()->json([
            'success' => true,
            'data' => $result['items'],
            'meta' => [
                'total' => $result['total'],
                'query' => $validated['q'],
            ],
        ]);
    }
}
