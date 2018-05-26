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
        'vimeo' => \BBIT\Playlist\Services\MediaProviders\VimeoService::class,
        'library' => \BBIT\Playlist\Services\MediaProviders\OwnLibraryService::class,
    ],
    'downloaders' => [
        'youtube' => \BBIT\Playlist\Service\Downloader\YouTubeDownloader::class,
        'vimeo' => \BBIT\Playlist\Service\Downloader\VimeoDownloader::class
//    'youtube' => \BBIT\Playlist\Service\Downloader\DummyDownloader::class
    ],

    'covers' => [
        'path' => storage_path('app/covers')
    ],

    'library' => [
        'ext' => 'mp3,aac,ogg',
        'path' => env('MEDIA_LIBRARY_PATH', null)
    ],

    'ionic' => [
        'youtube' => [
            'component' => 'cloud',
            'menuIcon' => 'logo-youtube',
            'title' => 'YouTube'
        ],
        'vimeo' => [
            'component' => 'cloud',
            'menuIcon' => 'logo-vimeo',
            'title' => 'Vimeo'
        ],
        'library' => [
            'component' => 'library',
            'menuIcon' => 'list-box',
            'title' => 'Library'
        ]
    ]
];