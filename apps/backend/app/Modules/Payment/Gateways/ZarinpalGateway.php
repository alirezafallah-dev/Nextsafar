<?php

namespace App\Modules\Payment\Gateways;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * درگاه پرداخت زرین‌پال
 */
class ZarinpalGateway implements GatewayInterface
{
    private string $merchantId;
    private string $callbackUrl;
    private bool $sandbox;

    private string $baseUrl = 'https://api.zarinpal.com/pg/v4';
    private string $paymentUrl = 'https://www.zarinpal.com/pg/StartPay/';

    public function __construct()
    {
        $this->merchantId = config('services.zarinpal.merchant_id', '');
        $this->callbackUrl = config('services.zarinpal.callback_url', '');
        $this->sandbox = config('services.zarinpal.sandbox', false);

        if ($this->sandbox) {
            $this->baseUrl = 'https://sandbox.zarinpal.com/pg/v4';
            $this->paymentUrl = 'https://sandbox.zarinpal.com/pg/StartPay/';
        }
    }

    public function getName(): string
    {
        return 'zarinpal';
    }

    /**
     * ایجاد تراکنش
     */
    public function purchase(float $amount, string $description, array $metadata = []): array
    {
        if (empty($this->merchantId)) {
            return [
                'success' => false,
                'error' => 'merchant_id_missing',
                'message' => 'Merchant ID زرین‌پال تنظیم نشده است',
            ];
        }

        try {
            $response = Http::timeout(30)
                ->acceptJson()
                ->post("{$this->baseUrl}/payment/request.json", [
                    'merchant_id' => $this->merchantId,
                    'amount' => (int) $amount,
                    'description' => $description,
                    'callback_url' => $this->callbackUrl,
                    'metadata' => $metadata,
                ]);

            $data = $response->json();

            if ($response->failed() || ($data['data']['code'] ?? 0) !== 100) {
                Log::error('Zarinpal purchase failed', [
                    'response' => $data,
                    'amount' => $amount,
                ]);

                return [
                    'success' => false,
                    'error' => 'purchase_failed',
                    'message' => $data['errors']['message'] ?? 'ایجاد تراکنش ناموفق بود',
                    'raw' => $data,
                ];
            }

            $authority = $data['data']['authority'];

            return [
                'success' => true,
                'authority' => $authority,
                'payment_url' => $this->paymentUrl . $authority,
                'fee' => $data['data']['fee'] ?? 0,
                'fee_type' => $data['data']['fee_type'] ?? '',
            ];

        } catch (\Throwable $e) {
            Log::error('Zarinpal purchase exception', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'network_error',
                'message' => 'خطا در ارتباط با زرین‌پال',
            ];
        }
    }

    /**
     * تایید پرداخت
     */
    public function verify(string $authority, float $expectedAmount): array
    {
        try {
            $response = Http::timeout(30)
                ->acceptJson()
                ->post("{$this->baseUrl}/payment/verify.json", [
                    'merchant_id' => $this->merchantId,
                    'authority' => $authority,
                    'amount' => (int) $expectedAmount,
                ]);

            $data = $response->json();
            $code = $data['data']['code'] ?? 0;

            // کدهای موفق: 100 (پرداخت موفق) و 101 (قبلاً تایید شده)
            if (in_array($code, [100, 101])) {
                return [
                    'success' => true,
                    'reference_id' => (string) ($data['data']['ref_id'] ?? ''),
                    'card_pan' => $data['data']['card_pan'] ?? '',
                    'card_hash' => $data['data']['card_hash'] ?? '',
                    'fee' => $data['data']['fee'] ?? 0,
                    'amount' => $data['data']['amount'] ?? $expectedAmount,
                ];
            }

            Log::warning('Zarinpal verify failed', [
                'authority' => $authority,
                'code' => $code,
                'message' => $data['errors']['message'] ?? '',
            ]);

            return [
                'success' => false,
                'error' => 'verify_failed',
                'message' => $data['errors']['message'] ?? 'تایید پرداخت ناموفق بود',
                'code' => $code,
            ];

        } catch (\Throwable $e) {
            Log::error('Zarinpal verify exception', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'network_error',
                'message' => 'خطا در تایید پرداخت',
            ];
        }
    }

    /**
     * استرداد وجه (در زرین‌پال معمولاً دستی انجام می‌شود)
     */
    public function refund(string $referenceId, float $amount): array
    {
        // زرین‌پال API رسمی برای استرداد ندارد
        // معمولاً از پنل کاربری انجام می‌شود
        return [
            'success' => false,
            'error' => 'not_supported',
            'message' => 'استرداد از طریق API پشتیبانی نمی‌شود',
        ];
    }

    /**
     * بررسی وضعیت تراکنش
     */
    public function inquiry(string $authority): array
    {
        try {
            $response = Http::timeout(30)
                ->acceptJson()
                ->post("{$this->baseUrl}/payment/inquiry.json", [
                    'merchant_id' => $this->merchantId,
                    'authorities' => [$authority],
                ]);

            $data = $response->json();

            return [
                'success' => true,
                'data' => $data,
            ];

        } catch (\Throwable $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * بررسی فعال بودن درگاه
     */
    public function isConfigured(): bool
    {
        return !empty($this->merchantId) && !empty($this->callbackUrl);
    }
}
