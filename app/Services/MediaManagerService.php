<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 15:46
 */

namespace BBIT\Playlist\Services;

use BBIT\Playlist\Contracts\DownloaderContract;
use BBIT\Playlist\Models\MediaProvider;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Service\Downloader\DummyDownloader;
use BBIT\Playlist\Service\Downloader\YouTubeDownloader;
use Illuminate\Foundation\Application;
use Symfony\Component\Process\Process;
use Thruway\ClientSession;


/**
 * Class MediaManager
 * @package BBIT\Playlist\Services
 */
class MediaManagerService
{
    /** @var ClientSession */
    private $session;
    /**
     * @var Application
     */
    private $app;

    /** @var DownloaderContract[] */
    private $downloaders;

    private $queue = [];

    /** @var Process */
    private $cmd;

    private static $downloaderAliases = [
//        'youtube' => YouTubeDownloader::class
        'youtube' => DummyDownloader::class
    ];

    /**
     * MediaManagerService constructor.
     * @param Application $app
     */
    public function __construct(Application $app)
    {
        $this->app = $app;
    }


    /**
     * @param ClientSession $session
     */
    public function attachToWampSession(ClientSession $session) {
        $this->session = $session;

        $session->register('com.mediaManager.download', [$this, 'download']);

        $session->getLoop()->addPeriodicTimer(1, function() {
            if (count($this->queue)) {
                if (!$this->cmd || !$this->cmd->isRunning()) {
                    $this->cmd = $this->process(array_shift($this->queue));
                }
            }
        });
    }

    /**
     * @param ClientSession $session
     */
    public function detachWampSession(ClientSession $session) {
        $session->unregister('com.mediaManager.download');
    }

    /**
     * @param $args
     * @throws \Exception
     */
    public function download($args) {
        $provider = getValue($args[0]->provider);
        $sid = getValue($args[0]->sid);
        $type = getValue($args[0]->type, 'video');
        $format = getValue($args[0]->format, 'mp3'); // @todo configurable default download format

        if ($provider && $sid) {
            $this->queue[] = [
                $provider,
                $sid,
                $type,
                $format
            ];

//            if (!$this->cmd && count($this->queue)) {
//                while (count($this->queue)) {
//                $this->cmd = $this->process(array_shift($this->queue));
//                }
//                $this->cmd = null;
//            }
        }

        $this->session->getLoop()->tick();
    }

    /**
     * @param $item
     * @return string
     */
    private function process($item) {
        $this->cmd = $item;

        list($provider, $sid, $type, $format) = $item;

        $downloader = $this->getDownloader($provider);

        if (!$downloader) {
            $this->session->publish('sub.error', [['message' => "$provider media downloader not found"]]);
        }
        else {
            try {
                if ('video' == $type) {
                    return $downloader->download($sid);
                }
                else {
                    return $downloader->downloadAudio($sid, $format);
                }
            }
            catch (\Throwable $t) {
                $this->session->publish('sub.error', [['message' => $t->getMessage()]]);
            }
        }

        return null;
    }

    /**
     * @param $name
     * @return DownloaderContract
     */
    private function getDownloader($name) {
        if (!isset($this->downloaders[$name])) {
            $this->downloaders[$name] = $this->app->make(static::$downloaderAliases[$name]);
        }

        return $this->downloaders[$name];
    }

}