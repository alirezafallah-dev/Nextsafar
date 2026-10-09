<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | NextSafar - WordPress Connection
    |--------------------------------------------------------------------------
    */

    'wordpress' => [
        'url' => env('WORDPRESS_URL', 'http://cms.nextsafar.local'),
        'timeout' => env('WORDPRESS_TIMEOUT', 15),
        'cache_ttl' => env('WORDPRESS_CACHE_TTL', 3600),
        'username' => env('WORDPRESS_USERNAME'),
        'app_password' => env('WORDPRESS_APP_PASSWORD'),
    ],

    /*
    |--------------------------------------------------------------------------
    | NextSafar - Custom Services
    |--------------------------------------------------------------------------
    */

    'kavenegar' => [
        'api_key' => env('KAVENEGAR_API_KEY', ''),
        'sender' => env('KAVENEGAR_SENDER', '10004346'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'serpapi' => [
        'key' => env('SERPAPI_KEY', ''),
    ],

    'searchapi' => [
        'key' => env('SEARCHAPI_KEY', ''),
    ],

    'search' => [
        'primary_provider' => env('SEARCH_PRIMARY_PROVIDER', 'serpapi'),
    ],

];
