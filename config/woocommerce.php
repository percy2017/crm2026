<?php

return [
    'store_url' => env('WOOCOMMERCE_STORE_URL'),
    'consumer_key' => env('WOOCOMMERCE_CONSUMER_KEY'),
    'consumer_secret' => env('WOOCOMMERCE_CONSUMER_SECRET'),
    'api_version' => env('WOOCOMMERCE_API_VERSION', 'v3'),
    'wp_api_integration' => env('WOOCOMMERCE_WP_API_INTEGRATION', true),
    'verify_ssl' => env('WOOCOMMERCE_VERIFY_SSL', false),
    'query_string_auth' => env('WOOCOMMERCE_QUERY_STRING_AUTH', false),
    'timeout' => env('WOOCOMMERCE_TIMEOUT', 30),
    'header_total' => env('WOOCOMMERCE_HEADER_TOTAL', 'x-wp-total'),
    'header_total_pages' => env('WOOCOMMERCE_HEADER_TOTAL_PAGES', 'x-wp-totalpages'),
];
