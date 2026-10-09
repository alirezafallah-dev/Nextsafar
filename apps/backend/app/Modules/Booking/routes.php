<?php

use App\Modules\Booking\Controllers\VisaBookingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Booking Routes
|--------------------------------------------------------------------------
*/

// Public: دریافت انواع مجاز مدارک
Route::get('/document-types', [VisaBookingController::class, 'documentTypes'])
    ->name('document.types');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // رزرو ویزا
    Route::prefix('visas')->group(function () {
        Route::post('/book', [VisaBookingController::class, 'store'])
            ->name('visa.booking.store');
    });

    // لیست رزروهای ویزای کاربر
    Route::get('/my-visa-bookings', [VisaBookingController::class, 'index'])
        ->name('visa.bookings.index');

    // مدیریت رزروها
    Route::prefix('bookings')->group(function () {
        // جزئیات رزرو
        Route::get('/{bookingId}', [VisaBookingController::class, 'show'])
            ->name('booking.show')
            ->where('bookingId', '[0-9]+');

        // لغو رزرو
        Route::post('/{bookingId}/cancel', [VisaBookingController::class, 'cancel'])
            ->name('booking.cancel')
            ->where('bookingId', '[0-9]+');

        // مدارک رزرو
        Route::prefix('/{bookingId}/documents')->group(function () {
            Route::get('/', [VisaBookingController::class, 'listDocuments'])
                ->name('booking.documents.list')
                ->where('bookingId', '[0-9]+');

            Route::post('/', [VisaBookingController::class, 'uploadDocument'])
                ->name('booking.documents.upload')
                ->where('bookingId', '[0-9]+');

            Route::delete('/{documentId}', [VisaBookingController::class, 'deleteDocument'])
                ->name('booking.documents.delete')
                ->where(['bookingId' => '[0-9]+', 'documentId' => '[0-9]+']);
        });
    });
});
