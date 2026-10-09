<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| در اینجا می‌توانید route های API خود را ثبت کنید.
| این route ها با middleware 'api' بارگذاری می‌شوند.
|
*/

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'version' => config('app.version', '1.0.0'),
    ]);
});

// Public routes (بدون نیاز به احراز هویت)
Route::prefix('auth')->group(function () {
    // این route ها در AuthServiceProvider اضافه می‌شوند
});

// Protected routes (با نیاز به احراز هویت)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
