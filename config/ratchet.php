<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Laravel Ratchet Configuration
    |--------------------------------------------------------------------------
    |
    | Here you can define the default settings for Laravel Ratchet.
    |
    */

    'class'           => \BBIT\Playlist\Services\WampServerService::class,
    'host'            => env('WAMP_HOST', '0.0.0.0'),
    'serverHost' => 'localhost',
    'port'            => '9090',
    'scheme' => env('WAMP_SCHEME', 'ws'),
    'connectionLimit' => false,
    'throttle'        => [
        'onOpen'    => '5:1',
        'onMessage' => '20:1',
     ],
    'abortOnMessageThrottle' => false,
    'blackList'              => [],
    'zmq'                    => [
        'host'   => '127.0.0.1',
        'port'   => 5555,
        'method' => \ZMQ::SOCKET_PULL,
    ],
];
