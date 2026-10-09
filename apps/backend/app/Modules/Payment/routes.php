<?php

use App\Modules\Payment\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Payment Routes
|--------------------------------------------------------------------------
*/

// Callback از درگاه (public - نیازی به auth ندارد)
Route::match(['get', 'post'], '/payments/callback', [PaymentController::class, 'callback'])
    ->name('payment.callback');

// Protected routes
Route::middleware('auth:sanctum')->prefix('bookings')->group(function () {
    // شروع پرداخت برای یک رزرو (با ID عددی برای جلوگیری از مشکل binding)
    Route::post('/{bookingId}/pay', [PaymentController::class, 'pay'])
        ->name('payment.pay')
        ->where('bookingId', '[0-9]+');
});

Route::middleware('auth:sanctum')->prefix('payments')->group(function () {
    // لیست پرداخت‌های کاربر
    Route::get('/', [PaymentController::class, 'index'])
        ->name('payment.index');

    // وضعیت یک پرداخت
    Route::get('/{paymentId}/status', [PaymentController::class, 'status'])
        ->name('payment.status')
        ->where('paymentId', '[0-9]+');
});
