<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Search\Controllers\SearchController;

Route::prefix('search')->group(function () {
    Route::get('/flights', [SearchController::class, 'searchFlights']);
    Route::get('/hotels', [SearchController::class, 'searchHotels']);
});
