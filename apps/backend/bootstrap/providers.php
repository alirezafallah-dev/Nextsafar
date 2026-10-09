<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Modules\Hotel\Providers\HotelServiceProvider::class,
    App\Modules\Auth\Providers\AuthServiceProvider::class,
    App\Modules\WordPress\Providers\WordPressServiceProvider::class,
    App\Modules\Payment\Providers\PaymentServiceProvider::class,
    App\Modules\Booking\Providers\BookingServiceProvider::class,
];
