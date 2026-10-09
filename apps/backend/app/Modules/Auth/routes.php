<?php

use App\Modules\Auth\Controllers\AuthController;
use App\Modules\Auth\Controllers\GoogleOAuthController;
use App\Modules\Auth\Controllers\OtpController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('auth')->group(function () {
    // OTP
    Route::post('/otp/send', [OtpController::class, 'send']);
    Route::post('/otp/verify', [AuthController::class, 'verifyOtp']);

    // Google OAuth
    Route::get('/google/redirect', [GoogleOAuthController::class, 'redirect']);
    Route::get('/google/callback', [GoogleOAuthController::class, 'callback']);
});

// Protected routes
Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
});
