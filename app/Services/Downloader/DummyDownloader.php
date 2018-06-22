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
     * @param string $url
     * @param string $sid
     * @return string
     */
    public function getName(string $url, string $sid) {
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
     * @param string $url
     * @param string $sid
     * @param string $outDir
     * @return Process
     */
    public function download(string $url, string $sid, string $outDir)
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
     * @param string $url
     * @param string $sid
     * @param string $outDir
     * @param string $format
     * @return string
     * @throws \Exception
     */
    public function downloadAudio(string $url, string $sid, string $outDir, string $format = 'mp3')
    {
        throw new \Exception('not implemented');
    }

    /**
     * @param string $url
     * @param string $sid
     * @return Collection
     */
    public function getVideos(string $url, string $sid)
    {
        return Collection::make([]);
    }

    /**
     * @param string $url
     * @param string $sid
     * @return Collection
     */
    public function getAudios(string $url, string $sid)
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
     * @param string $id
     * @return null|string
     */
    public function getOutDir(string $id)
    {
        return null;
    }


}