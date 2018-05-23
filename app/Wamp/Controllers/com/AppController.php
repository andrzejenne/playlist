<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 23.5.18
 * Time: 13:09
 */

namespace BBIT\Playlist\Wamp\Controllers\com;

use BBIT\Playlist\Models\MediaProvider;
use BBIT\Playlist\Providers\MediaLibraryProvider;


/**
 * Class AppController
 * @package BBIT\Playlist\Wamp\Controllers\com
 */
class AppController
{
    /** @var MediaLibraryProvider */
    private $mediaLibraryProvider;

    /**
     * @param MediaLibraryProvider $mediaLibraryProvider
     */
    public function __construct(MediaLibraryProvider $mediaLibraryProvider)
    {
        $this->mediaLibraryProvider = $mediaLibraryProvider;
    }

    /**
     * @param $args
     * @return array
     */
    public function providers($args)
    {
        $services = $this->mediaLibraryProvider->getServices();

        $providers = [];

        $ionicConfig = config('media.ionic');

        foreach ($services as $key => $service) {
            $providers[] = $service->getConfig()
                + ['entity' => MediaProvider::whereSlug($key)->first()->toArray()]
                + ['ionic' => isset($ionicConfig[$key]) ? $ionicConfig[$key] : null];
        }

        return $providers;
    }
}