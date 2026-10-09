<?php

return [
    'serpapi' => [
        'key' => env('SERPAPI_KEY', ''),
    ],
    
    'searchapi' => [
        'key' => env('SEARCHAPI_KEY', ''),
    ],
    
    'search' => [
        'primary_provider' => env('SEARCH_PRIMARY_PROVIDER', 'serpapi'),
    ],
    
    'kavenegar' => [
        'key' => env('KAVENEGAR_KEY', ''),
    ],
    
    'zarinpal' => [
        'merchant_id' => env('ZARINPAL_MERCHANT_ID', ''),
        'sandbox' => env('ZARINPAL_SANDBOX', true),
    ],
];
