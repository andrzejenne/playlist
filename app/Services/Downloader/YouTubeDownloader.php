<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 14:37
 */

namespace BBIT\Playlist\Service\Downloader;

use BBIT\Playlist\Contracts\DownloaderContract;
use BBIT\Playlist\Helpers\Process;
use BBIT\Playlist\Services\Downloader\Progress\YouTubeDownloadProgressReporter;
use Illuminate\Support\Collection;


/**
 * Class YouTubeDownloader
 * @package BBIT\Playlist\Service\Downloader
 */
class YouTubeDownloader extends DownloaderContract
{

    public static $possibleAudios = [
        'm4a'
    ];

    public static $possibleVideos = [
        'mp4'
    ];

    public static $audioTranscodeFormats = [
        'mp3',
        'vorbis'
    ];

    /**
     * @var YouTubeDownloadProgressReporter
     */
    private $reporter;

    /** @var array */
    private $_infoCache = [];

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
     * @throws \Exception
     */
    public function download($sid)
    {
        $videos = $this->getVideos($sid);
        $audios = $this->getAudios($sid);

        if ($videos->count() && $audios->count()) {
            $vcode = $videos->first()['format_id'];
            $acode = $audios->first()['format_id'];
            $cmd = static::run("--newline -f $vcode+$acode $sid", $this->reporter);

            if ($cmd->success()) {
                return $cmd->report();
            } else {
                throw new \Exception('Error downloading: ' . $cmd->error());
            }
        } else {
            throw new \Exception('Cannot download, missing mandatory streams');
        }
    }

    /**
     * @param $sid
     * @param string $format
     * @return string
     * @throws \Exception
     */
    public function downloadAudio($sid, $format = 'mp3')
    {
        if (!static::isAudioFormatValid($format)) {
            throw new \Exception("Invalid audio format $format");
        }

        $audios = $this->getAudios($sid);

        if ($audios->count()) {
            $acode = $audios->first()['format_id'];
            $cmd = static::run("--extract-audio --newline --audio-format $format -f $acode $sid", $this->reporter);

            if ($cmd->success()) {
                return $cmd->report();
            } else {
                throw new \Exception('Error downloading: ' . $cmd->error());
            }
        } else {
            throw new \Exception('Cannot download, missing mandatory stream');
        }
    }

    /**
     * @param $sid
     * @return Collection
     */
    public function getVideos($sid)
    {
        $info = $this->getInfo($sid);

        $collection = collect($info->formats);

        return $collection->filter(function ($item) {
            if (in_array($item->ext, static::$possibleVideos)) {
                return $item;
            }

            return false;
        })->sortByDesc(function ($item) {
            return $item->width;
        });
    }

    /**
     * @param $sid
     * @return Collection
     */
    public function getAudios($sid)
    {
        $info = $this->getInfo($sid);

        $collection = collect($info->formats);

        return $collection->filter(function ($item) {
            if (in_array($item['ext'], static::$possibleAudios)) {
                return $item;
            }

            return false;
        })->sortByDesc(function ($item) {
            return $item['abr'];
        }, SORT_NUMERIC);
    }

    /**
     * @param $sid
     * @return bool|mixed
     */
    private function getInfo($sid)
    {
        if (!isset($this->_infoCache[$sid])) {
            try {
                $info = json_decode(static::run("-J $sid")->info());
                $this->_infoCache[$sid] = $info;
            } catch (\Exception $e) {
                $this->_infoCache[$sid] = false;
            }
        }

        return $this->_infoCache[$sid];
    }

    /**
     * @param $args
     * @param YouTubeDownloadProgressReporter|null $reporter
     * @return Process
     * @throws \Exception
     */
    private static function run($args, YouTubeDownloadProgressReporter $reporter = null)
    {
        return Process::prepare('youtube-dl')
            ->enableOutput(null, $reporter ? $reporter->getOutputReader() : null)
            ->enableErrorOutput(null, $reporter ? $reporter->getErrorReader() : null)
            ->setWorkingDir(storage_path('temp'))
            ->execute($args);
    }

    /**
     * @param $format
     * @return bool
     */
    private static function isAudioFormatValid($format) {
        return in_array($format, static::$audioTranscodeFormats);
    }
}