<?php

return [
    App\Modules\Auth\Providers\AuthServiceProvider::class,
    App\Modules\Booking\Providers\BookingServiceProvider::class,
    App\Modules\Hotel\Providers\HotelServiceProvider::class,
    App\Modules\Payment\Providers\PaymentServiceProvider::class,
    App\Modules\WordPress\Providers\WordPressServiceProvider::class,
    App\Providers\AppServiceProvider::class,
    App\Providers\Filament\AdminPanelProvider::class,
];
