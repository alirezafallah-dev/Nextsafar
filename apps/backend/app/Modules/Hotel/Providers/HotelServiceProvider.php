<?php

namespace App\Modules\Hotel\Providers;

use App\Modules\Hotel\Services\HotelMatcherService;
use Illuminate\Support\ServiceProvider;

class HotelServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // ثبت سرویس Hotel Matcher
        $this->app->singleton(HotelMatcherService::class, function () {
            return new HotelMatcherService();
        });
    }

    public function boot(): void
    {
        // بارگذاری route های ماژول
        $this->loadRoutesFrom(__DIR__ . '/../routes.php');
    }
}
