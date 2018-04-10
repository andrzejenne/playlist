<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 14:57
 */

namespace BBIT\Playlist\Providers;

use BBIT\Playlist\Contracts\MediaProviderContract;
use BBIT\Playlist\Services\MediaProviders\YouTubeService;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;


/**
 * Class MediaLibraryProvider
 * @package BBIT\Playlist\Providers
 */
class MediaLibraryProvider extends ServiceProvider
{
    const YOUTUBE = 'youtube.media.service';

    public $bindings = [
        self::YOUTUBE => YouTubeService::class
    ];

    /**
     * MediaLibraryProvider constructor.
     * @param Application $app
     */
    public function __construct(Application $app)
    {
        parent::__construct($app);
    }


    /**
     * @return void
     */
    public function register()
    {
        foreach ($this->bindings as $alias => $binding) {
            $this->app->bind($alias, $binding);
        }
    }


    /**
     * @param null $alias
     * @return MediaProviderContract
     */
    public function getService($alias = null)
    {
        if (!$alias) {
            $alias = key($this->bindings);
        }

        return $this->app->make($this->bindings[$alias]);
    }
}