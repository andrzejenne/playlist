<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 15:46
 */

namespace BBIT\Playlist\Services;

use BBIT\Playlist\Contracts\DownloaderContract;
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\MediaFileType;
use BBIT\Playlist\Models\MediaProvider;
use BBIT\Playlist\Models\MediaType;
use BBIT\Playlist\Models\Medium;
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

    /**
     * @var MediaDiscoveryService
     */
    private $mediaDiscoveryService;

//    private static $downloaderAliases = [
//        'youtube' => YouTubeDownloader::class
//        'youtube' => DummyDownloader::class
//    ];

    /**
     * MediaManagerService constructor.
     * @param Application $app
     * @param MediaDiscoveryService $mediaDiscoveryService
     */
    public function __construct(Application $app, MediaDiscoveryService $mediaDiscoveryService)
    {
        $this->app = $app;
        $this->mediaDiscoveryService = $mediaDiscoveryService;
    }


    /**
     * @param ClientSession $session
     */
    public function attachToWampSession(ClientSession $session)
    {
        $this->session = $session;

        $session->register('com.mediaManager.download', [$this, 'download']);

        $session->getLoop()->addPeriodicTimer(.01, function () {
            if ($this->proc && !$this->proc->isRunning()) {
                $this->proc->finish();
                if ($this->proc->isSuccessful()) {
                    $this->mediaDiscoveryService->disoverMedia($this->proc);
                }
                $this->proc = null;
            } else {
                if (count($this->queue) && !$this->proc) {
                    $this->proc = $this->process(array_shift($this->queue));
                }
            }
        });
    }

    /**
     * @param ClientSession $session
     */
    public function detachWampSession(ClientSession $session)
    {
        $session->unregister('com.mediaManager.download');
    }

    /**
     * @param $args
     * @throws \Exception
     */
    public function download($args)
    {
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
    private function process(DownloadRequest $request)
    {
        $this->proc = $request;

        $provider = $request->getProvider();
        $downloader = null;
        try {
            $downloader = $this->getDownloader($provider);

        } catch (\Exception $e) {
            $this->reportThrowable($e);
        }

        if ($downloader) {
            try {
                return $request->makeDownload($downloader);
            } catch (\Throwable $t) {
                $this->reportThrowable($t);
            }
        }

        return null;
    }

    /**
     * @param $name
     * @return DownloaderContract
     * @throws \Exception
     */
    private function getDownloader($name)
    {
        if (!isset($this->downloaders[$name])) {
            $concrete = config('media.downloaders.' . $name);
            if ($concrete) {
                $this->downloaders[$name] = $this->app->make($concrete);
            } else {
                throw new \Exception('downloader ' . $name . ' not found');
            }
        }

        return $this->downloaders[$name];
    }

    /**
     * @param $msg
     */
    private function reportError($msg) {
        $this->session->publish('sub.error', [
            ['message' => $msg]
        ]);
    }

    /**
     * @param \Throwable $t
     */
    private function reportThrowable(\Throwable $t) {
        $this->reportError($t->getMessage());
    }
}