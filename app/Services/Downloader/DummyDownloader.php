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
 * Class DummyDownloader
 * @package BBIT\Playlist\Service\Downloader
 */
class DummyDownloader extends DownloaderContract
{

    /**
     * @var YouTubeDownloadProgressReporter
     */
    private $reporter;

    /**
     * YouTubeDownloader constructor.
     * @param YouTubeDownloadProgressReporter $reporter
     * @param MediaLibraryProvider $libraryProvider
     */
    public function __construct(YouTubeDownloadProgressReporter $reporter, MediaLibraryProvider $libraryProvider)
    {
        parent::__construct($libraryProvider);

        $this->reporter = $reporter;
    }

    /**
     * @param $url
     * @param $sid
     * @return string
     */
    public function getName($url, $sid) {
        return 'dummy.mkv';
    }

    /**
     * @return string
     */
    public function getProviderSlug()
    {
        return 'youtube';
    }


    /**
     * @param $url
     * @param $sid
     * @param $outDir
     * @return Process
     */
    public function download($url, $sid, $outDir)
    {
        if ($this->reporter) {
            $this->reporter->restart();
            $this->reporter->setUrl($sid);
        }

        $cmd = static::run(
            new Process(base_path('tests/Feature/logs/dummy.sh')),
            $this->reporter
        );

        return $cmd;
    }

    /**
     * @param $url
     * @param $sid
     * @param $outDir
     * @param string $format
     * @return string
     * @throws \Exception
     */
    public function downloadAudio($url, $sid, $outDir, $format = 'mp3')
    {
        throw new \Exception('not implemented');
    }

    /**
     * @param $url
     * @param $sid
     * @return Collection
     */
    public function getVideos($url, $sid)
    {
        return Collection::make([]);
    }

    /**
     * @param $url
     * @param $sid
     * @return Collection
     */
    public function getAudios($url, $sid)
    {
        return Collection::make([]);
    }

    /**
     *
     */
    public function finish()
    {
        if ($this->reporter) {
            $this->reporter->finish();
        }
    }

    /**
     * @param $id
     * @return null|string
     */
    public function getOutDir($id)
    {
        return null;
    }


}