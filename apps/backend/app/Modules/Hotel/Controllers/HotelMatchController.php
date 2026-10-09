<?php

namespace App\Modules\Hotel\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Hotel\DTOs\OnlineHotelDTO;
use App\Modules\Hotel\DTOs\SiteHotelDTO;
use App\Modules\Hotel\Services\HotelMatcherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HotelMatchController extends Controller
{
    public function __construct(
        private HotelMatcherService $matcherService
    ) {}

    /**
     * تست الگوریتم تطبیق
     */
    public function test(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'site_hotels' => 'required|array',
            'online_hotels' => 'required|array',
        ]);

        // تبدیل به DTO
        $siteHotels = array_map(
            fn($h) => SiteHotelDTO::fromArray($h),
            $validated['site_hotels']
        );

        $onlineHotels = array_map(
            fn($h) => OnlineHotelDTO::fromArray($h),
            $validated['online_hotels']
        );

        $result = $this->matcherService->matchAndMerge($siteHotels, $onlineHotels);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }
}
