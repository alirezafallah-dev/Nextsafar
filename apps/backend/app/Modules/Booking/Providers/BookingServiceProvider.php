<?php

namespace App\Modules\Booking\Providers;

use App\Modules\Booking\Services\DocumentUploadService;
use App\Modules\Booking\Services\VisaBookingService;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class BookingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(DocumentUploadService::class);
        $this->app->singleton(VisaBookingService::class);
    }

    public function boot(): void
    {
        Route::prefix('api')
            ->middleware('api')
            ->group(__DIR__ . '/../routes.php');
    }
}
