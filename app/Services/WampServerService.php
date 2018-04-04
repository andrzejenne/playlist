<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.4.18
 * Time: 17:28
 */

namespace BBIT\Playlist\Services;

use BBIT\Playlist\Providers\WampRouter;
use Thruway\Peer\ClientInterface;
use Thruway\Peer\Router;
use Thruway\Transport\RatchetTransportProvider;


/**
 * Class WampServer
 * @package BBIT\Playlist\Services
 */
class WampServerService
{
    /** @var ROuter */
    private $router;

    /**
     * WampServer constructor.
     */
    public function __construct()
    {
        $host = config('ratchet.host', 'localhost');
        $port = config('ratchet.port', 8080);

        $this->router = new Router();
        $this->router->addTransportProvider(new RatchetTransportProvider($host, $port));
    }

    /**
     * @param ClientInterface $client
     */
    public function addClient(ClientInterface $client)
    {
        $this->router->addInternalClient($client);
    }

    /**
     * @throws \Exception
     */
    public function run()
    {
        $this->router->start();
    }

}