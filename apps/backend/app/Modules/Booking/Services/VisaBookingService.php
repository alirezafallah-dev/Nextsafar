<?php

namespace App\Modules\Booking\Services;

use App\Models\User;
use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Booking\Enums\BookingType;
use App\Modules\Booking\Enums\PassengerType;
use App\Modules\Booking\Enums\VisaStatus;
use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Models\BookingPassenger;
use App\Modules\Booking\Models\VisaBooking;
use App\Modules\WordPress\Services\VisaService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * سرویس رزرو ویزا
 */
class VisaBookingService
{
    public function __construct(
        private VisaService $visaService
    ) {}

    /**
     * ایجاد رزرو ویزا
     */
    public function createBooking(User $user, array $data): array
    {
        // 1. دریافت اطلاعات ویزا از وردپرس
        $visaData = $this->visaService->getVisaBySlug($data['visa_slug']);

        if (!$visaData) {
            return [
                'success' => false,
                'error' => 'visa_not_found',
                'message' => 'ویزای مورد نظر یافت نشد',
            ];
        }

        // 2. دریافت قیمت از وردپرس (با fallback)
        $pricePerPerson = (float) ($visaData['price'] ?? 0);
        
        // اگر قیمت از وردپرس نخوانده شد، مقدار پیش‌فرض
        if ($pricePerPerson <= 0) {
            $pricePerPerson = 5000000; // 5 میلیون تومان پیش‌فرض
            Log::warning('Visa price is 0 or missing, using default price', [
                'visa_slug' => $data['visa_slug'],
                'default_price' => $pricePerPerson,
                'visa_data' => $visaData,
            ]);
        }

        // 3. بررسی حداقل یک مسافر
        $passengerCount = count($data['passengers'] ?? []);
        if ($passengerCount === 0) {
            return [
                'success' => false,
                'error' => 'no_passengers',
                'message' => 'حداقل یک مسافر باید مشخص شود',
            ];
        }

        // 4. محاسبه قیمت کل بر اساس نوع مسافر
        $totalAmount = 0;
        foreach ($data['passengers'] as $passenger) {
            $type = PassengerType::from($passenger['passenger_type'] ?? 'adult');
            $totalAmount += $pricePerPerson * $type->priceMultiplier();
        }

        // 5. ساخت رزرو در تراکنش
        try {
            $result = DB::transaction(function () use ($user, $visaData, $data, $totalAmount, $passengerCount, $pricePerPerson) {
                // ساخت Booking
                $booking = Booking::create([
                    'user_id' => $user->id,
                    'booking_type' => BookingType::VISA,
                    'item_source' => 'wordpress',
                    'item_id' => (string) ($visaData['id'] ?? ''),
                    'item_title' => $visaData['title'] ?? 'ویزا',
                    'status' => BookingStatus::PENDING,
                    'total_amount' => $totalAmount,
                    'currency' => $visaData['currency'] ?? 'IRR',
                    'passenger_count' => $passengerCount,
                    'booking_data' => [
                        'visa_slug' => $data['visa_slug'],
                        'country' => $visaData['country'] ?? null,
                        'country_code' => $visaData['country_code'] ?? null,
                        'visa_type' => $visaData['visa_type'] ?? 'tourist',
                        'price_per_person' => $pricePerPerson,
                        'currency' => $visaData['currency'] ?? 'IRR',
                    ],
                ]);

                // ساخت VisaBooking details
                VisaBooking::create([
                    'booking_id' => $booking->id,
                    'wordpress_post_id' => (int) ($visaData['id'] ?? 0),
                    'visa_title' => $visaData['title'] ?? '',
                    'visa_slug' => $data['visa_slug'],
                    'visa_type' => $visaData['visa_type'] ?? 'tourist',
                    'country' => $visaData['country'] ?? '',
                    'country_code' => $visaData['country_code'] ?? null,
                    'visa_status' => VisaStatus::DRAFT,
                    'applicant_data' => $data['applicant_data'] ?? null,
                ]);

                // ساخت مسافران
                $passengers = [];
                foreach ($data['passengers'] as $passengerData) {
                    $passenger = BookingPassenger::create(array_merge(
                        $passengerData,
                        [
                            'booking_id' => $booking->id,
                            'passenger_type' => $passengerData['passenger_type'] ?? 'adult',
                        ]
                    ));
                    $passengers[] = $passenger;
                }

                return [
                    'booking' => $booking,
                    'visa_details' => $booking->visaDetails,
                    'passengers' => $passengers,
                    'visa_info' => $visaData,
                ];
            });

            return [
                'success' => true,
                'message' => 'رزرو ویزا با موفقیت ایجاد شد',
                'data' => $this->formatBookingResponse($result['booking'], $result['visa_info']),
            ];

        } catch (\Throwable $e) {
            Log::error('Visa booking creation failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'visa_slug' => $data['visa_slug'] ?? null,
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => 'creation_failed',
                'message' => 'خطا در ایجاد رزرو: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * دریافت جزئیات رزرو
     */
    public function getBookingDetails(Booking $booking): array
    {
        if ($booking->booking_type !== BookingType::VISA) {
            return [
                'success' => false,
                'error' => 'invalid_booking_type',
                'message' => 'این رزرو از نوع ویزا نیست',
            ];
        }

        $booking->load([
            'user',
            'passengers',
            'documents',
            'visaDetails',
            'payments' => fn($q) => $q->latest()->limit(1),
        ]);

        // دریافت اطلاعات به‌روز از وردپرس
        $visaInfo = null;
        if ($booking->visaDetails) {
            $visaInfo = $this->visaService->getVisaBySlug($booking->visaDetails->visa_slug);
        }

        return [
            'success' => true,
            'data' => $this->formatBookingResponse($booking, $visaInfo),
        ];
    }

    /**
     * لیست رزروهای کاربر
     */
    public function getUserBookings(User $user, int $perPage = 20): array
    {
        $bookings = $user->bookings()
            ->where('booking_type', BookingType::VISA->value)
            ->with(['visaDetails', 'payments' => fn($q) => $q->latest()->limit(1)])
            ->latest()
            ->paginate($perPage);

        return [
            'success' => true,
            'data' => $bookings->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_code' => $booking->booking_code,
                    'visa_title' => $booking->item_title,
                    'country' => $booking->booking_data['country'] ?? null,
                    'visa_type' => $booking->booking_data['visa_type'] ?? null,
                    'status' => $booking->status->value,
                    'status_label' => $booking->status->label(),
                    'visa_status' => $booking->visaDetails?->visa_status?->value,
                    'visa_status_label' => $booking->visaDetails?->visa_status?->label(),
                    'total_amount' => (float) $booking->total_amount,
                    'currency' => $booking->currency,
                    'passenger_count' => $booking->passenger_count,
                    'is_paid' => $booking->isPaid(),
                    'created_at' => $booking->created_at->toIso8601String(),
                ];
            }),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
            ],
        ];
    }

    /**
     * لغو رزرو
     */
    public function cancelBooking(Booking $booking, string $reason): array
    {
        if (!$booking->isCancellable()) {
            return [
                'success' => false,
                'error' => 'not_cancellable',
                'message' => 'این رزرو قابل لغو نیست',
            ];
        }

        if ($booking->isPaid()) {
            return [
                'success' => false,
                'error' => 'paid_booking',
                'message' => 'برای لغو رزرو پرداخت شده، با پشتیبانی تماس بگیرید',
            ];
        }

        $booking->changeStatus(BookingStatus::CANCELLED, [
            'reason' => $reason,
            'cancelled_by' => 'user',
        ]);

        return [
            'success' => true,
            'message' => 'رزرو با موفقیت لغو شد',
        ];
    }

    /**
     * فرمت پاسخ رزرو
     */
    private function formatBookingResponse(Booking $booking, ?array $visaInfo): array
    {
        $booking->load(['passengers', 'documents', 'visaDetails', 'payments' => fn($q) => $q->latest()->limit(1)]);

        return [
            'id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'status' => $booking->status->value,
            'status_label' => $booking->status->label(),
            'visa_info' => $visaInfo ? [
                'id' => $visaInfo['id'],
                'title' => $visaInfo['title'],
                'country' => $visaInfo['country'] ?? null,
                'visa_type' => $visaInfo['visa_type'] ?? null,
                'processing_days' => $visaInfo['processing_days'] ?? null,
                'price' => $visaInfo['price'] ?? null,
            ] : null,
            'visa_details' => $booking->visaDetails ? [
                'visa_status' => $booking->visaDetails->visa_status->value,
                'visa_status_label' => $booking->visaDetails->visa_status->label(),
                'submitted_at' => $booking->visaDetails->submitted_at?->toIso8601String(),
                'reviewed_at' => $booking->visaDetails->reviewed_at?->toIso8601String(),
                'issued_at' => $booking->visaDetails->issued_at?->toIso8601String(),
            ] : null,
            'financial' => [
                'total_amount' => (float) $booking->total_amount,
                'currency' => $booking->currency,
                'is_paid' => $booking->isPaid(),
                'payment_status' => $booking->payment_status,
                'last_payment' => $booking->payments->first() ? [
                    'status' => $booking->payments->first()->status->value,
                    'amount' => (float) $booking->payments->first()->amount,
                    'paid_at' => $booking->payments->first()->paid_at?->toIso8601String(),
                ] : null,
            ],
            'passengers' => $booking->passengers->map(function ($p) {
                return [
                    'id' => $p->id,
                    'full_name' => $p->full_name,
                    'full_name_fa' => $p->full_name_fa,
                    'passenger_type' => $p->passenger_type->value,
                    'passenger_type_label' => $p->passenger_type->label(),
                    'passport_number' => $p->passport_number,
                    'national_id' => $p->national_id,
                    'birth_date' => $p->birth_date?->format('Y-m-d'),
                    'gender' => $p->gender,
                ];
            }),
            'documents_count' => $booking->documents->count(),
            'created_at' => $booking->created_at->toIso8601String(),
        ];
    }
}
