<?php

namespace App\Modules\Auth\Providers;

use App\Modules\Auth\Services\AuthService;
use App\Modules\Auth\Services\KavenegarSmsService;
use App\Modules\Auth\Services\OtpService;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(KavenegarSmsService::class);
        $this->app->singleton(OtpService::class);
        $this->app->singleton(AuthService::class);
    }

    public function boot(): void
    {
        Route::prefix('api')
            ->middleware('api')
            ->group(__DIR__ . '/../routes.php');
    }
}
