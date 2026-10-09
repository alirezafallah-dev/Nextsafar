<?php

namespace App\Modules\WordPress\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WordPress\Services\VisaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VisaController extends Controller
{
    public function __construct(
        private VisaService $visaService
    ) {}

    /**
     * لیست ویزاها
     * GET /api/visas
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['country', 'search', 'orderby', 'order']);
        $page = (int) $request->input('page', 1);
        $perPage = min((int) $request->input('per_page', 20), 100);

        $result = $this->visaService->getVisas($filters, $page, $perPage);

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
     * جزئیات ویزا
     * GET /api/visas/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $visa = $this->visaService->getVisaBySlug($slug);

        if (!$visa) {
            return response()->json([
                'success' => false,
                'error' => 'not_found',
                'message' => 'ویزای مورد نظر یافت نشد',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $visa,
        ]);
    }

    /**
     * ویزاهای محبوب
     * GET /api/visas/popular/list
     */
    public function popular(Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 8), 20);
        $visas = $this->visaService->getPopularVisas($limit);

        return response()->json([
            'success' => true,
            'data' => $visas,
        ]);
    }

    /**
     * جستجوی ویزاها
     * GET /api/visas/search
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $result = $this->visaService->searchVisas(
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
