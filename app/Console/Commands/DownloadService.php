<?php

namespace BBIT\Playlist\Console\Commands;

use BBIT\Playlist\Contracts\DownloaderContract;
use BBIT\Playlist\Service\Downloader\YouTubeDownloader;
use BBIT\Playlist\Services\WampClientService;
use Illuminate\Console\Command;
use Illuminate\Foundation\Application;
use Thruway\ClientSession;
use Thruway\Logging\Logger;

/**
 * Class DownloadService
 * @package BBIT\Playlist\Console\Commands
 * @deprecated
 */
class DownloadService extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'service:download {sid}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Download service';

    /**
     * @var Application
     */
    private $app;

    /**
     * Create a new command instance.
     *
     * @param Application $app
     */
    public function __construct(Application $app)
    {
        parent::__construct();
        $this->app = $app;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     * @throws \Exception
     */
    public function handle()
    {
        /** @var WampClientService $wampClient */
        $wampClient = $this->app->make(WampClientService::class);

        $wampClient->onOpen(function(ClientSession $session) use ($wampClient) {

            /** @var DownloaderContract $downloader */
            $downloader = $this->app->make(YouTubeDownloader::class);

            $sid = $this->argument('sid');
            $name = $downloader->getName($sid);

            Logger::info('name:', $name);
//            if ($info) {
//                $downloader->download($sid);
//            }
            $wampClient->stop();
        });

        $wampClient->run();

    }
}
