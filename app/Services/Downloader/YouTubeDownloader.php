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
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;


/**
 * Class YouTubeDownloader
 * @package BBIT\Playlist\Service\Downloader
 */
class YouTubeDownloader extends DownloaderContract
{

    public static $possibleAudios = [
        'aac',
        'mp3',
        'm4a',
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
     * @param MediaLibraryProvider $libraryProvider
     */
    public function __construct(
        YouTubeDownloadProgressReporter $reporter,
        MediaLibraryProvider $libraryProvider
    ) {
        parent::__construct($libraryProvider);

        $this->reporter = $reporter;
    }

    /**
     * @param string $url
     * @param string $sid
     * @return string
     */
    public function getName(string $url, string $sid)
    {
        $info = $this->getInfo($url, $sid);

        return $info->title;
    }


    /**
     * @param string $url
     * @param string $sid
     * @param string $outDir
     * @return Process|null
     */
    public function download(string $url, string $sid, string $outDir)
    {
        $this->reporter->setUrl($sid);

        $videos = $this->getVideos($url, $sid);
        $audios = $this->getAudios($url, $sid);

        if ($videos && $audios && $videos->count() && $audios->count()) {
            $vcode = $videos->first()->format_id;
            if ($audios->count()) {
                $acode = $audios->first()->format_id;
                $fCode = "$vcode+$acode";
            } else {
                $fCode = $vcode;
            }
            if ($this->reporter) {
                $this->reporter->restart();
                $this->reporter->setUrl($sid);
            }
//            \Storage::makeDirectory($outDir)
            if (!file_exists($outDir)) {
                mkdir($outDir, 0777, true);
            }

//            $cmd = static::run("--newline -f $vcode+$acode $sid -o '$outDir/%(id)s.%(ext)s'", $this->reporter);
//            \Storage::put('/tmp/test', "youtube-dl --newline -f $vcode+$acode $sid --keep-fragments --write-all-thumbnails -f mp4 --recode-video mp4 -o '$outDir/%(id)s.%(ext)s'");

            return static::run(
                static::getProcess("--newline -f $fCode $url --keep-fragments --write-all-thumbnails -f mp4 --recode-video mp4 -o '$outDir/%(id)s.%(ext)s'"),
                $this->reporter);
        } else {
            $this->reporter->readErrorOutput('Cannot download, missing mandatory streams');
//            throw new \Exception('Cannot download, missing mandatory streams');
        }

        return null;
    }

    /**
     * @param string $url
     * @param string $sid
     * @param string $outDir
     * @param string $format
     * @return Process|null
     * @throws \Exception
     */
    public function downloadAudio(string $url, string $sid, string $outDir, string $format = 'mp3')
    {
        $this->reporter->setUrl($sid);

        if (!static::isAudioFormatValid($format)) {
            throw new \Exception("Invalid audio format $format");
        }

        $audios = $this->getAudios($url, $sid);

        if ($audios->count()) {
            $acode = $audios->first()->format_id;
            if ($this->reporter) {
                $this->reporter->restart();
                $this->reporter->setUrl($sid);
            }
            if (!file_exists($outDir)) {
                mkdir($outDir, 0777, true);
            }

            return static::run(
                static::getProcess("--extract-audio --newline --audio-format $format -f $acode $url -o '$outDir/%(id)s.%(ext)s'"),
                $this->reporter
            );
        } else {
            $this->reporter->readErrorOutput('Cannot download, missing mandatory streams');
        }

        return null;
    }

    /**
     * @param string $url
     * @param string $sid
     * @return bool|Collection
     */
    public function getVideos(string $url, string $sid)
    {
        $info = $this->getInfo($url, $sid);

        if ($info !== false && isset($info->formats)) {
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

        return false;
    }

    /**
     * @param string $url
     * @param string $sid
     * @return bool|Collection
     */
    public function getAudios(string $url, string $sid)
    {
        $info = $this->getInfo($url, $sid);

        if ($info !== false && isset($info->formats)) {
            $collection = collect($info->formats);

            return $collection->filter(function ($item) {
                if (in_array($item->ext, static::$possibleAudios)) {
                    return $item;
                }

                return false;
            })->sortByDesc(function ($item) {
                return isset($item->abr) ? $item->abr : 0;
                // @todo - vimeo differs
            }, SORT_NUMERIC);
        }

        return false;
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
     * @return string
     */
    public function getProviderSlug()
    {
        return 'youtube';
    }


    /**
     * @param string $url
     * @param string $sid
     * @return bool|mixed
     */
    protected function getInfo(string $url, string $sid)
    {
        if (!isset($this->_infoCache[$sid])) {
            try {
                $cmd = static::run(
                    static::getProcess("-J \"$url\"")
                );

                $cmd->wait(); // @todo - make async, we have to return Promise

                $output = $cmd->getOutput();
                if ($cmd->isSuccessful()) {
                    $info = json_decode($output);
                    $this->_infoCache[$sid] = $info;
                } else {
                    Log::error('youtube-dl not working properly', ['stderr' => $cmd->getErrorOutput()]);
                    $this->_infoCache[$sid] = false;
                }
            } catch (\Exception $e) {
                $this->_infoCache[$sid] = false;
            }
        }

        return $this->_infoCache[$sid];
    }

    /**
     * @param mixed $args
     * @return Process
     */
    protected static function getProcess($args)
    {
        if (is_string($args)) {
            $args = [$args];
        }

        return new Process('youtube-dl ' . implode(' ', $args), storage_path('temp'));
    }

    /**
     * @param string $format
     * @return bool
     */
    protected static function isAudioFormatValid(string $format)
    {
        return in_array($format, static::$audioTranscodeFormats);
    }

    /**
     * @param Process $cmd
     * @return string
     * @throws \Exception
     */
    private static function getCmdStatus(Process $cmd)
    {
        if ($cmd->isSuccessful()) {
            return $cmd->getOutput();
        } else {
            throw new \Exception('Error downloading: ' . $cmd->getErrorOutput());
        }
    }
}
