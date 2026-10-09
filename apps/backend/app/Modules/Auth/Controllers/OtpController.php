<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OtpController extends Controller
{
    public function __construct(
        private OtpService $otpService
    ) {}

    /**
     * Send OTP to phone number
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string|regex:/^09[0-9]{9}$/',
            'purpose' => 'sometimes|string|in:login,register,reset_password',
        ]);

        $result = $this->otpService->sendOtp(
            $validated['phone'],
            $request->ip(),
            $validated['purpose'] ?? 'login'
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => $result['error'],
                'message' => $result['message'],
            ], 400);
        }

        return response()->json($result);
    }
}
