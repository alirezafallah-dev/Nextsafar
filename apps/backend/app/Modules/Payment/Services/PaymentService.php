<?php

namespace App\Modules\Payment\Services;

use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Booking\Models\Booking;
use App\Modules\Payment\Enums\PaymentGateway;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Gateways\GatewayInterface;
use App\Modules\Payment\Gateways\ZarinpalGateway;
use App\Modules\Payment\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * سرویس اصلی پرداخت
 */
class PaymentService
{
    private array $gateways = [];

    public function __construct()
    {
        $this->gateways[PaymentGateway::ZARINPAL->value] = new ZarinpalGateway();
    }

    /**
     * دریافت درگاه پرداخت
     */
    public function getGateway(string $gatewayName): ?GatewayInterface
    {
        return $this->gateways[$gatewayName] ?? null;
    }

    /**
     * شروع فرآیند پرداخت
     */
    public function initiatePayment(Booking $booking, string $gatewayName = 'zarinpal'): array
    {
        // بررسی اینکه رزرو نیاز به پرداخت دارد
        if ($booking->isPaid()) {
            return [
                'success' => false,
                'error' => 'already_paid',
                'message' => 'این رزرو قبلاً پرداخت شده است',
            ];
        }

        // بررسی مبلغ
        if ($booking->total_amount <= 0) {
            return [
                'success' => false,
                'error' => 'invalid_amount',
                'message' => 'مبلغ رزرو نامعتبر است',
            ];
        }

        $gateway = $this->getGateway($gatewayName);
        if (!$gateway) {
            return [
                'success' => false,
                'error' => 'invalid_gateway',
                'message' => 'درگاه پرداخت نامعتبر است',
            ];
        }

        // ایجاد رکورد Payment
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'user_id' => $booking->user_id,
            'gateway' => PaymentGateway::from($gatewayName),
            'amount' => $booking->total_amount,
            'currency' => $booking->currency,
            'status' => PaymentStatus::PENDING,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // فراخوانی درگاه
        $description = "پرداخت رزرو {$booking->booking_code} - {$booking->booking_type->label()}";
        $metadata = [
            'booking_id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'user_id' => $booking->user_id,
            'mobile' => $booking->user->phone ?? '',
            'email' => $booking->user->email ?? '',
        ];

        $result = $gateway->purchase(
            $booking->total_amount,
            $description,
            $metadata
        );

        if (!$result['success']) {
            $payment->update(['status' => PaymentStatus::FAILED]);

            return $result;
        }

        // ذخیره authority
        $payment->update([
            'authority_code' => $result['authority'],
            'status' => PaymentStatus::REDIRECTING,
        ]);

        // تغییر وضعیت رزرو به awaiting_payment
        $booking->update([
            'status' => BookingStatus::AWAITING_PAYMENT,
            'payment_status' => 'awaiting_payment',
        ]);

        return [
            'success' => true,
            'payment_id' => $payment->id,
            'authority' => $result['authority'],
            'payment_url' => $result['payment_url'],
            'message' => 'در حال انتقال به درگاه پرداخت...',
        ];
    }

    /**
     * تایید پرداخت (بعد از بازگشت از درگاه)
     */
    public function verifyPayment(Request $request, string $gatewayName = 'zarinpal'): array
    {
        $gateway = $this->getGateway($gatewayName);
        if (!$gateway) {
            return [
                'success' => false,
                'error' => 'invalid_gateway',
                'message' => 'درگاه نامعتبر',
            ];
        }

        // استخراج authority از request
        $authority = $request->input('Authority') ?? $request->input('authority');
        $status = $request->input('Status') ?? $request->input('status');

        if (empty($authority)) {
            return [
                'success' => false,
                'error' => 'missing_authority',
                'message' => 'شناسه تراکنش یافت نشد',
            ];
        }

        // یافتن payment
        $payment = Payment::where('authority_code', $authority)->first();

        if (!$payment) {
            return [
                'success' => false,
                'error' => 'payment_not_found',
                'message' => 'تراکنش یافت نشد',
            ];
        }

        // اگر کاربر لغو کرده باشد
        if ($status === 'NOK' || $status === 'canceled') {
            $payment->update([
                'status' => PaymentStatus::CANCELLED,
                'callback_data' => $request->all(),
            ]);

            $payment->booking->update([
                'status' => BookingStatus::CANCELLED,
                'cancellation_reason' => 'لغو توسط کاربر در درگاه پرداخت',
                'cancelled_at' => now(),
            ]);

            return [
                'success' => false,
                'error' => 'user_cancelled',
                'message' => 'پرداخت توسط کاربر لغو شد',
                'booking_code' => $payment->booking->booking_code,
            ];
        }

        // تایید پرداخت
        $result = $gateway->verify($authority, $payment->amount);

        // ذخیره callback data
        $payment->callback_data = $request->all();

        if (!$result['success']) {
            $payment->update(['status' => PaymentStatus::FAILED]);

            return array_merge($result, [
                'booking_code' => $payment->booking->booking_code,
            ]);
        }

        // پرداخت موفق - به‌روزرسانی در تراکنش
        DB::transaction(function () use ($payment, $result) {
            $payment->update([
                'status' => PaymentStatus::SUCCESS,
                'reference_id' => $result['reference_id'],
                'card_number' => $result['card_pan'] ?? null,
                'card_hash' => $result['card_hash'] ?? null,
                'paid_at' => now(),
                'gateway_response' => $result,
            ]);

            $booking = $payment->booking;
            $booking->update([
                'status' => BookingStatus::PAID,
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);
        });

        return [
            'success' => true,
            'message' => 'پرداخت با موفقیت انجام شد',
            'booking_code' => $payment->booking->booking_code,
            'reference_id' => $result['reference_id'],
            'card_pan' => $result['card_pan'] ?? null,
            'amount' => $result['amount'],
        ];
    }

    /**
     * بررسی وضعیت یک پرداخت
     */
    public function getPaymentStatus(int $paymentId): array
    {
        $payment = Payment::with('booking')->find($paymentId);

        if (!$payment) {
            return [
                'success' => false,
                'error' => 'not_found',
            ];
        }

        return [
            'success' => true,
            'payment' => [
                'id' => $payment->id,
                'status' => $payment->status->value,
                'status_label' => $payment->status->label(),
                'amount' => $payment->formatted_amount,
                'gateway' => $payment->gateway->label(),
                'paid_at' => $payment->paid_at?->toIso8601String(),
                'booking_code' => $payment->booking->booking_code,
            ],
        ];
    }
}
