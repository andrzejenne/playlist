<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 15:46
 */

namespace BBIT\Playlist\Services;

use BBIT\Playlist\Contracts\DownloaderContract;
use BBIT\Playlist\Service\Downloader\DummyDownloader;
use BBIT\Playlist\Service\Downloader\YouTubeDownloader;
use BBIT\Playlist\Services\Downloader\DownloadProcess;
use BBIT\Playlist\Services\Downloader\DownloadRequest;
use Illuminate\Foundation\Application;
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

    /** @var DownloadRequest[] */
    private $queue = [];

    /** @var DownloadProcess */
    private $proc;

    private static $downloaderAliases = [
        'youtube' => YouTubeDownloader::class
//        'youtube' => DummyDownloader::class
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

        $session->getLoop()->addPeriodicTimer(.01, function() {
            if ($this->proc && !$this->proc->isRunning()) {
                $this->proc->finish();
                $this->proc = null;
            }
            else {
                if (count($this->queue) && !$this->proc) {
                    $this->proc = $this->process(array_shift($this->queue));
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
            $this->queue[] = DownloadRequest::create(
                $provider,
                $sid,
                $type,
                $format
            );
        }
    }

    /**
     * @param $request
     * @return DownloadProcess|null
     */
    private function process(DownloadRequest $request) {
        $this->proc = $request;

        $provider = $request->getProvider();
        $downloader = $this->getDownloader($provider);

        if (!$downloader) {
            $this->session->publish('sub.error', [['message' => "$provider media downloader not found"]]);
        }
        else {
            try {
                return $request->makeDownload($downloader);
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