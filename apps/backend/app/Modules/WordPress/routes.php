<?php

use App\Modules\WordPress\Controllers\ArticleController;
use App\Modules\WordPress\Controllers\TourController;
use App\Modules\WordPress\Controllers\VisaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| WordPress Content Routes
|--------------------------------------------------------------------------
|
| این route ها محتوای وردپرس را ارائه می‌دهند:
| - تورها (از پست تایپ tour)
| - ویزاها (از پست تایپ visa)
| - اخبار سفر (از پست تایپ travelnews)
| - راهنماهای سفر (از پست تایپ travelguide)
|
*/

// تورها
Route::prefix('tours')->group(function () {
    Route::get('/', [TourController::class, 'index']);
    Route::get('/featured/list', [TourController::class, 'featured']);
    Route::get('/search', [TourController::class, 'search']);
    Route::get('/{slug}', [TourController::class, 'show']);
});

// ویزاها
Route::prefix('visas')->group(function () {
    Route::get('/', [VisaController::class, 'index']);
    Route::get('/popular/list', [VisaController::class, 'popular']);
    Route::get('/search', [VisaController::class, 'search']);
    Route::get('/{slug}', [VisaController::class, 'show']);
});

// اخبار سفر
Route::prefix('news')->group(function () {
    Route::get('/', [ArticleController::class, 'news']);
    Route::get('/{slug}', [ArticleController::class, 'newsDetail']);
});

// راهنماهای سفر
Route::prefix('guides')->group(function () {
    Route::get('/', [ArticleController::class, 'guides']);
    Route::get('/{slug}', [ArticleController::class, 'guideDetail']);
});

// جستجوی مقالات
Route::get('/articles/search', [ArticleController::class, 'search']);
