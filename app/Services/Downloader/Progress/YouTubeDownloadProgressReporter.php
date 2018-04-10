<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 15:45
 */

namespace BBIT\Playlist\Services\Downloader\Progress;

use BBIT\Playlist\Contracts\ProcessReporterContract;
use Thruway\ClientSession;

/**
 * Class ProgressReporter
 * @package BBIT\Playlist\Services\Downloader\Progress
 */
class YouTubeDownloadProgressReporter extends ProcessReporterContract
{
    private $progress = 0;

    private $started = false;

    private $finished = false;

    private $filename = null;

    const FILENAME_DOWNLOAD_REGEX = '/\[download\]\s+Destination:\s+(.+)/',
        FILENAME_FFMPEG_REGEX = '/\[ffmpeg\][^"]+"([^"]+)"/',
        PROGRESS_REGEX = '/\[download\]\s+([^%]+)%.+ETA\s+(\d+:\d+)/'; // @todo - speed

    /**
     * @param $line
     */
    public function readOutput($line)
    {
        if (!$this->started) {
            $this->started = true;
            $this->reportEvent('started');
        }
        if (preg_match(static::PROGRESS_REGEX, $line, $matches)) {
            $this->progress = +$matches[1];
            $this->reportEvent('progress', $this->progress);
        }
        else if (preg_match(static::FILENAME_DOWNLOAD_REGEX, $line, $matches)) {
            $this->filename = $matches[1];
            $this->reportEvent('filename', $this->filename);
        }
        else {
            // @todo -
        }
    }

    /**
     * @param $line
     */
    public function readErrorOutput($line)
    {
        $this->reportEvent('finished', $line);
    }

    public function finish()
    {
        $this->reportEvent('finished');
    }

    private function reportEvent($event, $args = null)
    {

    }

}