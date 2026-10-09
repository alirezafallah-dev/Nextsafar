<?php

namespace App\Modules\Booking\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Models\BookingDocument;
use App\Modules\Booking\Requests\CreateVisaBookingRequest;
use App\Modules\Booking\Requests\UploadDocumentRequest;
use App\Modules\Booking\Services\DocumentUploadService;
use App\Modules\Booking\Services\VisaBookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VisaBookingController extends Controller
{
    public function __construct(
        private VisaBookingService $visaBookingService,
        private DocumentUploadService $documentUploadService
    ) {}

    /**
     * ایجاد رزرو ویزا
     * POST /api/visas/book
     */
    public function store(CreateVisaBookingRequest $request): JsonResponse
    {
        $result = $this->visaBookingService->createBooking(
            $request->user(),
            $request->validated()
        );

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result, 201);
    }

    /**
     * لیست رزروهای ویزای کاربر
     * GET /api/my-visa-bookings
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 20);
        $result = $this->visaBookingService->getUserBookings($request->user(), $perPage);

        return response()->json($result);
    }

    /**
     * جزئیات یک رزرو
     * GET /api/bookings/{bookingId}
     */
    public function show(Request $request, int $bookingId): JsonResponse
    {
        $booking = Booking::with('visaDetails')->find($bookingId);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'error' => 'not_found',
                'message' => 'رزرو یافت نشد',
            ], 404);
        }

        // بررسی مالکیت
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'unauthorized',
                'message' => 'شما به این رزرو دسترسی ندارید',
            ], 403);
        }

        $result = $this->visaBookingService->getBookingDetails($booking);
        return response()->json($result);
    }

    /**
     * لغو رزرو
     * POST /api/bookings/{bookingId}/cancel
     */
    public function cancel(Request $request, int $bookingId): JsonResponse
    {
        $booking = Booking::find($bookingId);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'error' => 'not_found',
                'message' => 'رزرو یافت نشد',
            ], 404);
        }

        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'unauthorized',
                'message' => 'شما به این رزرو دسترسی ندارید',
            ], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $result = $this->visaBookingService->cancelBooking($booking, $validated['reason']);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    /**
     * آپلود مدرک
     * POST /api/bookings/{bookingId}/documents
     */
    public function uploadDocument(UploadDocumentRequest $request, int $bookingId): JsonResponse
    {
        $booking = Booking::find($bookingId);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'error' => 'not_found',
                'message' => 'رزرو یافت نشد',
            ], 404);
        }

        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'unauthorized',
                'message' => 'شما به این رزرو دسترسی ندارید',
            ], 403);
        }

        $validated = $request->validated();

        $result = $this->documentUploadService->upload(
            $booking,
            $validated['file'],
            $validated['document_type'],
            $validated['passenger_id'] ?? null,
            $validated['title'] ?? null
        );

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result, 201);
    }

    /**
     * لیست مدارک یک رزرو
     * GET /api/bookings/{bookingId}/documents
     */
    public function listDocuments(Request $request, int $bookingId): JsonResponse
    {
        $booking = Booking::find($bookingId);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'error' => 'not_found',
                'message' => 'رزرو یافت نشد',
            ], 404);
        }

        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'unauthorized',
                'message' => 'شما به این رزرو دسترسی ندارید',
            ], 403);
        }

        $result = $this->documentUploadService->getDocuments($booking);
        return response()->json($result);
    }

    /**
     * حذف مدرک
     * DELETE /api/bookings/{bookingId}/documents/{documentId}
     */
    public function deleteDocument(Request $request, int $bookingId, int $documentId): JsonResponse
    {
        $booking = Booking::find($bookingId);
        $document = BookingDocument::find($documentId);

        if (!$booking || !$document) {
            return response()->json([
                'success' => false,
                'error' => 'not_found',
                'message' => 'رزرو یا مدرک یافت نشد',
            ], 404);
        }

        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'unauthorized',
                'message' => 'شما به این رزرو دسترسی ندارید',
            ], 403);
        }

        $result = $this->documentUploadService->delete($document, $booking);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    /**
     * دریافت انواع مجاز مدارک
     * GET /api/document-types
     */
    public function documentTypes(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'types' => $this->documentUploadService->getAllowedTypes(),
        ]);
    }
}
