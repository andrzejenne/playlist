<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 15:46
 */

namespace BBIT\Playlist\Services;

use BBIT\Playlist\Contracts\DownloaderContract;
use BBIT\Playlist\Contracts\MediaProviderContract;
use BBIT\Playlist\Providers\MediaLibraryProvider;
use BBIT\Playlist\Services\Downloader\DownloadProcess;
use BBIT\Playlist\Services\Downloader\DownloadRequest;
use BBIT\Playlist\Wamp\WampRequest;
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

    /** @var DownloadProcess|null */
    private $proc;

    /**
     * @var MediaDiscoveryService
     */
    private $mediaDiscoveryService;
    /**
     * @var MediaLibraryProvider
     */
    private $libraryProvider;

//    private static $downloaderAliases = [
//        'youtube' => YouTubeDownloader::class
//        'youtube' => DummyDownloader::class
//    ];

    /**
     * MediaManagerService constructor.
     * @param Application $app
     * @param MediaDiscoveryService $mediaDiscoveryService
     * @param MediaLibraryProvider $libraryProvider
     */
    public function __construct(
        Application $app,
        MediaDiscoveryService $mediaDiscoveryService,
        MediaLibraryProvider $libraryProvider
    ) {
        $this->app = $app;
        $this->mediaDiscoveryService = $mediaDiscoveryService;
        $this->libraryProvider = $libraryProvider;
    }


    /**
     * @param ClientSession $session
     */
    public function attachToWampSession(ClientSession $session)
    {
        $this->session = $session;

        $session->register('com.mediaManager.download', function(...$args){
            $this->download(WampRequest::create(...$args));
        });

        $session->getLoop()->addPeriodicTimer(.01, function () {
            if ($this->proc && !$this->proc->isRunning()) {
                $this->proc->finish();
                if ($this->proc->isSuccessful()) {
                    $this->mediaDiscoveryService->disoverDownloadedMedia($this->proc);
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
     * @param WampRequest $request
     * @throws \Exception
     */
    public function download(WampRequest $request)
    {
        $provider = $this->libraryProvider->getService(
            $request->getArgument('provider')
        );
        $sid = $request->getArgument('sid');
        $type = $request->getArgument('type', 'video');
        $format = $request->getArgument('format', 'mp3'); // @todo configurable default download format

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
     * @param DownloadRequest $request
     * @return DownloadProcess|null
     */
    private function process(DownloadRequest $request)
    {
        $provider = $request->getProvider();
        $downloader = null;
        try {
            $downloader = $this->getDownloader($provider);

        } catch (\Throwable $t) {
            $this->reportThrowable($t);
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
     * @param MediaProviderContract $provider
     * @return DownloaderContract
     * @throws \Exception
     */
    private function getDownloader(MediaProviderContract $provider)
    {
        $name = $provider->getSlug();

        if (!isset($this->downloaders[$name])) {
            $concrete = config('media.downloaders.' . $name);
            if ($concrete) {
                $this->downloaders[$name] = $this->app->make($concrete);
            } else {
                throw new \Exception('downloader ' . $provider . ' not found');
            }
        }

        return $this->downloaders[$name];
    }

    /**
     * @param string $msg
     */
    private function reportError($msg)
    {
        $this->session->publish('sub.error', [
            ['message' => $msg]
        ]);
    }

    /**
     * @param \Throwable $t
     */
    private function reportThrowable(\Throwable $t)
    {
        $this->reportError($t->getMessage());
    }
}