<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'NextSafar API is running',
        'docs' => '/api/health',
    ]);
});
