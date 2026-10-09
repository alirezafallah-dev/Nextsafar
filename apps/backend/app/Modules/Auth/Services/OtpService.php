<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Models\OtpCode;
use Illuminate\Support\Facades\Log;

class OtpService
{
    const OTP_LENGTH = 6;
    const RATE_LIMIT_PER_10_MIN = 3;

    public function __construct(
        private KavenegarSmsService $smsService
    ) {}

    /**
     * Generate and send OTP
     */
    public function sendOtp(string $phone, string $ip, string $purpose = 'login'): array
    {
        // Rate limiting
        $recentCount = OtpCode::countRecent($phone, $ip);
        if ($recentCount >= self::RATE_LIMIT_PER_10_MIN) {
            return [
                'success' => false,
                'error' => 'rate_limit_exceeded',
                'message' => 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید.',
            ];
        }

        // Generate OTP
        $code = $this->generateCode();

        // Store OTP
        OtpCode::createCode($phone, $code, $ip, $purpose);

        // Send SMS
        $smsResult = $this->smsService->sendOtp($phone, $code);

        if (!$smsResult['success']) {
            Log::warning('OTP SMS failed', [
                'phone' => $phone,
                'error' => $smsResult['error'] ?? 'unknown',
            ]);

            return $smsResult;
        }

        $response = [
            'success' => true,
            'message' => 'کد تایید با موفقیت ارسال شد',
            'expires_in' => OtpCode::TTL_MINUTES * 60,
        ];

        // در حالت توسعه، کد را هم برگردان (برای تست)
        if (isset($smsResult['dev_mode']) && $smsResult['dev_mode']) {
            $response['otp_code'] = $code;
            $response['dev_mode'] = true;
        }

        return $response;
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(string $phone, string $code): array
    {
        $otp = OtpCode::verify($phone, $code);

        if (!$otp) {
            return [
                'success' => false,
                'error' => 'invalid_or_expired',
                'message' => 'کد تایید نامعتبر یا منقضی شده است',
            ];
        }

        return [
            'success' => true,
            'phone' => $phone,
            'purpose' => $otp->purpose,
        ];
    }

    /**
     * Generate 6-digit OTP code
     */
    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), self::OTP_LENGTH, '0', STR_PAD_LEFT);
    }
}
