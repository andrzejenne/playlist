<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 14:57
 */

namespace BBIT\Playlist\Providers;

use BBIT\Playlist\Contracts\MediaProviderContract;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;


/**
 * Class MediaLibraryProvider
 * @package BBIT\Playlist\Providers
 */
class MediaLibraryProvider extends ServiceProvider
{
    const SUFFIX = 'media.provider.library';

    public $bindings;

    /** @var MediaProviderContract[] */
    private $services;

    /**
     * MediaLibraryProvider constructor.
     * @param Application $app
     */
    public function __construct(Application $app)
    {
        parent::__construct($app);

        $this->services = [];
        $this->bindings = config('media.providers');
    }


    /**
     * @return void
     */
    public function register()
    {
        foreach ($this->bindings as $slug => $binding) {
            $this->app->bind(static::getAlias($slug), $binding);
        }
    }


    /**
     * @param string $alias
     * @return MediaProviderContract
     */
    public function getService(string $alias = null)
    {
        if (!$alias) {
            $alias = key($this->bindings);
        }

        if (!isset($this->services[$alias])) {
            $this->services[$alias] = $this->app->make(
                static::getAlias($alias)
            );
        }

        return $this->services[$alias];
    }

    /**
     * @return MediaProviderContract[]
     */
    public function getServices() {
        $services = [];
        foreach ($this->bindings as $key => $alias) {
            $services[$key] = $this->getService($key);
        }

        return $services;
    }

    /**
     * @param string $slug
     * @return string
     */
    public static function getAlias(string $slug)
    {
        return $slug . '.' . static::SUFFIX;
    }
}