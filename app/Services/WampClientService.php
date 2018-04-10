<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.4.18
 * Time: 17:28
 */

namespace BBIT\Playlist\Services;

use BBIT\Playlist\Wamp\WampRouter;
use Thruway\ClientSession;
use Thruway\Peer\Client;
use Thruway\Peer\ClientInterface;
use Thruway\Peer\Router;
use Thruway\Transport\PawlTransportProvider;
use Thruway\Transport\RatchetTransportProvider;


/**
 * Class WampClientService
 * @package BBIT\Playlist\Services
 */
class WampClientService
{
    /** @var ClientSession */
    private $session;

    /** @var Client */
    private $client;

    /** @var */
    private $onOpen;

    /**
     * WampServer constructor.
     * @throws \Exception
     */
    public function __construct()
    {
        $host = config('ratchet.host', 'localhost');
        $port = config('ratchet.port', 8080);
        $proto = config('ratchet.proto', 'ws://');

        $this->client = new Client('playlist'); // @todo - realm to config
        $this->client->addTransportProvider(new PawlTransportProvider($proto . $host . $port));

        $this->client->on('open', function(ClientSession $session) {
            $this->session = $session;
            if ($this->onOpen) {
                $this->onOpen($session);
            }
        });
    }


    public function onOpen($callback) {
        $this->onOpen = $callback;
    }

    /**
     * @throws \Exception
     */
    public function run()
    {
        $this->client->start();
    }

}