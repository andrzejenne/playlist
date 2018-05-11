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
    )
    {
        parent::__construct($libraryProvider);

        $this->reporter = $reporter;
    }

    /**
     * @param $sid
     * @return string
     */
    public function getName($sid)
    {
        $info = $this->getInfo($sid);

        return $info->title;
    }


    /**
     * @param $sid
     * @param $outDir
     * @return string
     */
    public function download($sid, $outDir)
    {
        $videos = $this->getVideos($sid);
        $audios = $this->getAudios($sid);

        if ($videos->count() && $audios->count()) {
            $vcode = $videos->first()->format_id;
            $acode = $audios->first()->format_id;
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
                static::getProcess("--newline -f $vcode+$acode $sid --keep-fragments --write-all-thumbnails -f mp4 --recode-video mp4 -o '$outDir/%(id)s.%(ext)s'"),
                $this->reporter);
        } else {
            $this->reporter->readErrorOutput('Cannot download, missing mandatory streams');
//            throw new \Exception('Cannot download, missing mandatory streams');
        }

        return null;
    }

    /**
     * @param $sid
     * @param $outDir
     * @param string $format
     * @return string
     * @throws \Exception
     */
    public function downloadAudio($sid, $outDir, $format = 'mp3')
    {
        if (!static::isAudioFormatValid($format)) {
            throw new \Exception("Invalid audio format $format");
        }

        $audios = $this->getAudios($sid);

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
                static::getProcess("--extract-audio --newline --audio-format $format -f $acode $sid -o '$outDir/%(id)s.%(ext)s'"),
                $this->reporter
            );
        } else {
            $this->reporter->readErrorOutput('Cannot download, missing mandatory streams');
        }

        return null;
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
            if (in_array($item->ext, static::$possibleAudios)) {
                return $item;
            }

            return false;
        })->sortByDesc(function ($item) {
            return $item->abr;
        }, SORT_NUMERIC);
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
     * @return string
     * @deprecated
     */
    public function getOutDir($id)
    {
        return storage_path('app/media/youtube/' . $id[0] . $id[1] . '/' . $id[2] . $id[3]);
    }


    /**
     * @return string
     */
    public function getProviderSlug()
    {
        return 'youtube';
    }


    /**
     * @param $sid
     * @return bool|mixed
     */
    private function getInfo($sid)
    {
        if (!isset($this->_infoCache[$sid])) {
            try {
                $cmd = static::run(
                    static::getProcess("-J $sid")
                );

                $cmd->wait(); // @todo - make async, we have to return Promise

                $output = $cmd->getOutput();
                $info = json_decode($output);
                $this->_infoCache[$sid] = $info;
            } catch (\Exception $e) {
                $this->_infoCache[$sid] = false;
            }
        }

        return $this->_infoCache[$sid];
    }

    /**
     * @param $args
     * @return Process
     */
    private static function getProcess($args)
    {
        if (is_string($args)) {
            $args = [$args];
        }

        return new Process('youtube-dl ' . implode(' ', $args), storage_path('temp'));
    }

    /**
     * @param $format
     * @return bool
     */
    private static function isAudioFormatValid($format)
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