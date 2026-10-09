<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class GoogleOAuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * Redirect to Google OAuth
     */
    public function redirect(): JsonResponse
    {
        $url = Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json([
            'success' => true,
            'redirect_url' => $url,
        ]);
    }

    /**
     * Handle Google callback
     */
    public function callback(Request $request): JsonResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            if (!$googleUser->email) {
                return response()->json([
                    'success' => false,
                    'error' => 'email_required',
                    'message' => 'ایمیل از گوگل دریافت نشد',
                ], 400);
            }

            // Login or register user
            $user = $this->authService->loginWithGoogle(
                $googleUser->email,
                $googleUser->name,
                $googleUser->avatar,
                $googleUser->id
            );

            // Create token
            $token = $this->authService->createToken($user, 'google-oauth');

            return response()->json([
                'success' => true,
                'message' => 'ورود با گوگل با موفقیت انجام شد',
                'data' => [
                    'user' => $this->authService->getUserInfo($user),
                    'token' => $token,
                    'token_type' => 'Bearer',
                ],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => 'oauth_failed',
                'message' => 'ورود با گوگل ناموفق بود: ' . $e->getMessage(),
            ], 400);
        }
    }
}
