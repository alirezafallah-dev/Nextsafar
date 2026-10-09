<?php

namespace App\Modules\Payment\Providers;

use App\Modules\Payment\Gateways\ZarinpalGateway;
use App\Modules\Payment\Services\PaymentService;
use App\Modules\Payment\Services\RefundService;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ZarinpalGateway::class);
        $this->app->singleton(PaymentService::class);
    }

    public function boot(): void
    {
        Route::prefix('api')
            ->middleware('api')
            ->group(__DIR__ . '/../routes.php');
    }
}
