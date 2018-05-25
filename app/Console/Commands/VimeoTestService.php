<?php

namespace BBIT\Playlist\Console\Commands;

use BBIT\Playlist\Contracts\DownloaderContract;
use BBIT\Playlist\Providers\MediaLibraryProvider;
use BBIT\Playlist\Service\Downloader\YouTubeDownloader;
use BBIT\Playlist\Services\MediaProviders\VimeoService;
use BBIT\Playlist\Services\WampClientService;
use Illuminate\Console\Command;
use Illuminate\Foundation\Application;
use Thruway\ClientSession;
use Thruway\Logging\Logger;

/**
 * Class DownloadService
 * @package BBIT\Playlist\Console\Commands
 */
class VimeoTestService extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:vimeo {query}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vimeo Testing Service';

    /**
     * @var MediaLibraryProvider
     */
    private $provider;

    /**
     * Create a new command instance.
     *
     * @param MediaLibraryProvider $provider
     */
    public function __construct(MediaLibraryProvider $provider)
    {
        parent::__construct();
        $this->provider = $provider;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     * @throws \Exception
     */
    public function handle()
    {
        /** @var VimeoService $service */
        $service = $this->provider->getService('vimeo');

        $results = $service->search('top gun');

    }
}
