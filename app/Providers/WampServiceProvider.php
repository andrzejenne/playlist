<?php

namespace BBIT\Playlist\Providers;

use BBIT\Playlist\Services\WampClientService;
use BBIT\Playlist\Services\WampServerService;
use BBIT\Playlist\Wamp\WampRouter;
use Illuminate\Support\ServiceProvider;

/**
 * Class WampServiceProvider
 * @package BBIT\Playlist\Providers
 */
class WampServiceProvider extends ServiceProvider
{

    protected $defer = true;

    /**
     * @var string
     */
    protected $namespace = 'BBIT\Playlist\Wamp\Controllers';

    /**
     * @return void
     */
    public function register()
    {
        $this->app->bind(WampServerService::class, WampServerService::class);
        $this->app->bind(WampClientService::class, WampClientService::class);
        $this->app->singleton(WampRouter::class, WampRouter::class);
        $this->app->alias(WampRouter::class, 'wamp');
    }

    /**
     * @return array
     */
    public function provides()
    {
        return parent::provides()
            + [
                WampServerService::class,
                WampClientService::class,
                WampRouter::class,
                'wamp'
            ];
    }


}
