<?php

namespace BBIT\Playlist\Console\Commands;

use BBIT\Playlist\Providers\WampRouter;
use BBIT\Playlist\Services\WampServerService;
use Illuminate\Console\Command;

class WampServer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wamp:server';

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
     * Create a new command instance.
     *
     * @param WampServerService $service
     * @param WampRouter $routes
     */
    public function __construct(WampServerService $service)
    {
        parent::__construct();

        $this->service = $service;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     * @throws \Exception
     */
    public function handle()
    {
        $this->service->run();
    }
}
