<?php

use App\Modules\Hotel\Controllers\HotelMatchController;
use Illuminate\Support\Facades\Route;

Route::prefix('hotels')->group(function () {
    Route::post('/match/test', [HotelMatchController::class, 'test']);
});
