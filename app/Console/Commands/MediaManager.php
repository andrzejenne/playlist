<?php

namespace BBIT\Playlist\Console\Commands;

use BBIT\Playlist\Services\MediaManagerService;
use BBIT\Playlist\Services\WampClientService;
use BBIT\Playlist\Services\WampServerService;
use Illuminate\Console\Command;
use Illuminate\Foundation\Application;
use Thruway\ClientSession;

/**
 * Class WampServer
 * @package BBIT\Playlist\Console\Commands
 */
class MediaManager extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:manage';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Media manager Server';

    /**
     * @var WampServerService
     */
    private $service;
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
        $this->service = $this->app->make(WampClientService::class);
        /** @var MediaManagerService $manager */
        $manager = $this->app->make(MediaManagerService::class);

        $this->service->onOpen(function(ClientSession $session) use ($manager) {
           $manager->attachToWampSession($session);
        });

        $this->service->run();
    }
}
