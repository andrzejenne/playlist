<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 22.4.18
 * Time: 14:10
 */

return [
    'downloaders' => [
        'youtube' => \BBIT\Playlist\Service\Downloader\YouTubeDownloader::class
//    'youtube' => \BBIT\Playlist\Service\Downloader\DummyDownloader::class
    ]
];