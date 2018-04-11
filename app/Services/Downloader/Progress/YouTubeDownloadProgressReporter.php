<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 15:45
 */

namespace BBIT\Playlist\Services\Downloader\Progress;

use BBIT\Playlist\Contracts\YoutubeDLWampProcessReporterContract;

/**
 * Class ProgressReporter
 * @package BBIT\Playlist\Services\Downloader\Progress
 */
class YouTubeDownloadProgressReporter extends YoutubeDLWampProcessReporterContract
{
    private $filename = null;

    const FILENAME_DOWNLOAD_REGEX = '/\[download\]\s+Destination:\s+(.+)/',
        FILENAME_FFMPEG_REGEX = '/\[ffmpeg\][^"]+"([^"]+)"/',
        PROGRESS_REGEX = '/\[download\]\s+([^%]+)%.+ETA\s+(\d+:\d+)/'; // @todo - speed, estimation

    /**
     *
     */
    public function restart()
    {
        parent::restart();
        $this->filename = null;
    }


    /**
     * @param $line
     * @throws \Exception
     */
    public function readOutput($line)
    {
        try {
            if (!$this->started) {
                $this->started = true;
                $this->finished = false;
                $this->progress = 0;
                $this->reportEvent(static::EVENT_START, [
                    'url' => $this->getUrl()
                ]);
            }
            if (preg_match(static::PROGRESS_REGEX, $line, $matches)) {
                $this->progress = +$matches[1];
                $this->reportEvent(static::EVENT_PROGRESS, [
                    'progress' => $this->progress,
                    'filename' => $this->filename,
                    'url' => $this->getUrl()
                ]);
            } else {
                if (preg_match(static::FILENAME_DOWNLOAD_REGEX, $line, $matches)) {
                    $this->filename = $matches[1];
                    $this->progress = 0;
                    $this->reportEvent(static::EVENT_FILENAME, [
                        'url' => $this->getUrl(),
                        'filename' => $this->filename
                    ]);
                } else {
                    $this->reportEvent(static::EVENT_STATUS, [
                        'url' => $this->getUrl(),
                        'filename' => $this->filename
                    ]);
                }
            }
        }
        catch (\Throwable $t) {
            throw new \Exception('Error Occured: ' . $t->getMessage());
        }
    }

    /**
     * @param $line
     */
    public function readErrorOutput($line)
    {
        $this->reportEvent(static::EVENT_ERROR, ['line' => $line, 'url' => $this->getUrl()]);
    }

    /**
     *
     */
    public function finish()
    {
        $this->finished = true;
        $this->reportEvent(static::EVENT_FINISH, ['url' => $this->getUrl()]);
    }

}