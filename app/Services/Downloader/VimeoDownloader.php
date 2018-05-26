<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 14:37
 */

namespace BBIT\Playlist\Service\Downloader;

use BBIT\Playlist\Contracts\DownloaderContract;
use BBIT\Playlist\Providers\MediaLibraryProvider;
use BBIT\Playlist\Services\Downloader\Progress\YouTubeDownloadProgressReporter;
use Illuminate\Support\Collection;
use Symfony\Component\Process\Process;


/**
 * Class VimeoDownloader
 * @package BBIT\Playlist\Service\Downloader
 */
class VimeoDownloader extends YouTubeDownloader
{

    /**
     * @param $url
     * @param $sid
     * @return string
     */
    public function getName($url, $sid)
    {
        $info = $this->getInfo($url, $sid);

        return $info->title;
    }


    /**
     * @return string
     */
    public function getProviderSlug()
    {
        return 'vimeo';
    }
}