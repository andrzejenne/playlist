<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 22.4.18
 * Time: 14:10
 */

return [
    'providers' => [
        'youtube' => \BBIT\Playlist\Services\MediaProviders\YouTubeService::class,
        'library' => \BBIT\Playlist\Services\MediaProviders\OwnLibraryService::class
    ],
    'downloaders' => [
        'youtube' => \BBIT\Playlist\Service\Downloader\YouTubeDownloader::class
//    'youtube' => \BBIT\Playlist\Service\Downloader\DummyDownloader::class
    ],

    'library' => [
        'ext' => 'mp3,aac,ogg',
        'path' => '/mnt/temp/music/'
    ]
];