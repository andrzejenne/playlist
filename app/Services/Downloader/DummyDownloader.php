<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 14:37
 */

namespace BBIT\Playlist\Service\Downloader;

use BBIT\Playlist\Contracts\DownloaderContract;
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
     */
    public function __construct(YouTubeDownloadProgressReporter $reporter)
    {
        $this->reporter = $reporter;
    }

    /**
     * @param $sid
     * @return string
     */
    public function getName($sid) {
        return 'dummy.mkv';
    }

    /**
     * @param $sid
     * @return Process
     * @throws \Exception
     */
    public function download($sid)
    {
        if ($this->reporter) {
            $this->reporter->restart();
            $this->reporter->setUrl($sid);
        }

        $cmd = static::run(base_path('tests/Feature/logs/dummy.sh'), $this->reporter);

//        return $cmd->getOutput();

        return $cmd;
    }

    /**
     * @param $sid
     * @param string $format
     * @return string
     * @throws \Exception
     */
    public function downloadAudio($sid, $format = 'mp3')
    {
        throw new \Exception('not implemented');
    }

    /**
     * @param $sid
     * @return Collection
     */
    public function getVideos($sid)
    {
        return Collection::make([]);
    }

    /**
     * @param $sid
     * @return Collection
     */
    public function getAudios($sid)
    {
        return Collection::make([]);
    }

    /**
     * @param $cmd
     * @param YouTubeDownloadProgressReporter|null $reporter
     * @return Process
     */
    private static function run($cmd, YouTubeDownloadProgressReporter $reporter = null)
    {
        $cmd = new Process($cmd, storage_path('temp'));

        $cmd->setTimeout(null);

        $callback = null;
        if ($reporter) {
            $callback = function($type, $buffer) use ($reporter) {
                if (Process::ERR == $type) {
                    $reporter->readErrorOutput(rtrim($buffer, "\n"));
                }
                else {
                    $reporter->readOutput(rtrim($buffer, "\n"));
                }
            };
        }
        $cmd->enableOutput()
            ->start($callback);

//        $cmd->wait();

//        if ($reporter) {
//            $reporter->finish();
//        }

        return $cmd;
    }
}