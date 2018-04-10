<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 15:46
 */

namespace BBIT\Playlist\Services;

use BBIT\Playlist\Contracts\DownloaderContract;
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
    }

    /**
     * @param $args
     */
    private function download($args) {
        $provider = getValue($args[0]->provider);
        $sid = getValue($args[0]->sid);

        if ($provider && $sid) {
            $this->session->publish('sub.mediaManager.start', [['sid' => $sid]]);

            $downloader = $this->getDownloader($provider);

            if (!$downloader) {
                $this->session->publish('sub.error', [['message' => "$name media downloader not found"]]);
            }
            else {
                $downloader->download($sid);
            }
        }
    }

    /**
     * @param $name
     * @return DownloaderContract
     */
    private function getDownloader($name) {
        if (!isset($this->downloaders[$name])) {
            $this->downloaders[$name] = $this->app->make($name.'.media.service');

        }

        return $this->downloaders[$name];
    }

}