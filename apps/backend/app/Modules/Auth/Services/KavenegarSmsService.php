<?php

namespace App\Modules\Auth\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KavenegarSmsService
{
    private string $apiKey;
    private string $sender;

    public function __construct()
    {
        $this->apiKey = config('services.kavenegar.api_key', '');
        $this->sender = config('services.kavenegar.sender', '10004346');
    }

    /**
     * Send OTP SMS
     */
    public function sendOtp(string $phone, string $code): array
    {
        if (empty($this->apiKey)) {
            // در حالت development، فقط لاگ می‌کنیم
            if (app()->environment('local', 'development')) {
                Log::info('OTP (Dev Mode)', [
                    'phone' => $phone,
                    'code' => $code,
                ]);
                
                return [
                    'success' => true,
                    'message_id' => 'dev-mode-' . uniqid(),
                    'dev_mode' => true,
                ];
            }

            return [
                'success' => false,
                'error' => 'api_key_missing',
                'message' => 'کلید API کاوه‌نگار تنظیم نشده',
            ];
        }

        $message = "کد تایید شما در نکست‌سفر:\n{$code}\nاین کد را در اختیار کسی قرار ندهید.\nnextsafar.com";

        try {
            $response = Http::timeout(15)->post(
                "https://api.kavenegar.com/v1/{$this->apiKey}/sms/send.json",
                [
                    'receptor' => $phone,
                    'message' => $message,
                    'sender' => $this->sender,
                ]
            );

            if ($response->failed()) {
                Log::error('Kavenegar SMS failed', [
                    'phone' => $phone,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [
                    'success' => false,
                    'error' => 'sms_send_failed',
                    'message' => 'ارسال پیامک ناموفق بود',
                ];
            }

            $body = $response->json();

            if (!isset($body['return']['status']) || $body['return']['status'] !== 200) {
                return [
                    'success' => false,
                    'error' => 'kavenegar_error',
                    'message' => $body['return']['message'] ?? 'خطای کاوه‌نگار',
                ];
            }

            Log::info('OTP SMS sent successfully', ['phone' => $phone]);

            return [
                'success' => true,
                'message_id' => $body['entries'][0]['messageid'] ?? null,
            ];

        } catch (\Throwable $e) {
            Log::error('Kavenegar SMS exception', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'network_error',
                'message' => 'خطای شبکه در ارسال پیامک',
            ];
        }
    }

    /**
     * Check if service is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey) || app()->environment('local', 'development');
    }
}
