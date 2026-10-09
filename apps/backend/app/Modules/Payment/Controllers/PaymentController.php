<?php

namespace App\Modules\Payment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Models\Booking;
use App\Modules\Payment\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    /**
     * شروع پرداخت برای یک رزرو
     * POST /api/bookings/{bookingId}/pay
     */
    public function pay(Request $request, int $bookingId): JsonResponse
    {
        $booking = Booking::find($bookingId);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'error' => 'not_found',
                'message' => 'رزرو مورد نظر یافت نشد',
            ], 404);
        }

        // بررسی مالکیت رزرو
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'unauthorized',
                'message' => 'شما به این رزرو دسترسی ندارید',
            ], 403);
        }

        $gateway = $request->input('gateway', 'zarinpal');
        $result = $this->paymentService->initiatePayment($booking, $gateway);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    /**
     * تایید پرداخت (callback از درگاه)
     * GET/POST /api/payments/callback
     */
    public function callback(Request $request): JsonResponse
    {
        $gateway = $request->input('gateway', 'zarinpal');
        $result = $this->paymentService->verifyPayment($request, $gateway);

        $statusCode = $result['success'] ? 200 : 400;
        return response()->json($result, $statusCode);
    }

    /**
     * بررسی وضعیت پرداخت
     * GET /api/payments/{paymentId}/status
     */
    public function status(int $paymentId): JsonResponse
    {
        $result = $this->paymentService->getPaymentStatus($paymentId);

        if (!$result['success']) {
            return response()->json($result, 404);
        }

        return response()->json($result);
    }

    /**
     * لیست پرداخت‌های کاربر
     * GET /api/payments
     */
    public function index(Request $request): JsonResponse
    {
        $payments = $request->user()
            ->payments()
            ->with('booking')
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }
}
