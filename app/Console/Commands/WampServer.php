<?php

namespace BBIT\Playlist\Console\Commands;

use BBIT\Playlist\Services\WampServerService;
use Illuminate\Console\Command;
use Illuminate\Foundation\Application;

/**
 * Class WampServer
 * @package BBIT\Playlist\Console\Commands
 */
class WampServer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wamp:serve';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'WAMP Server';

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
        $this->service = $this->app->make(WampServerService::class);

        $this->service->run();
    }
}
