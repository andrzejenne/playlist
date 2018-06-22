<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.4.18
 * Time: 17:28
 */

namespace BBIT\Playlist\Services;

use BBIT\Playlist\Wamp\WampRouter;
use Illuminate\Foundation\Application;
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

    /** @var callable */
    private $onOpenCallback;

    /**
     * WampServer constructor.
     * @param Application $app
     * @throws \Exception
     */
    public function __construct(Application $app)
    {
        $host = config('ratchet.serverHost', 'localhost');
        $port = config('ratchet.port', 8080);
        $scheme = config('ratchet.scheme', 'ws://');

        $this->client = new Client('playlist'); // @todo - realm to config

        $url = $scheme . '://' . $host . ':' . $port; // @todo - helper

        $this->client->addTransportProvider(new PawlTransportProvider($url));

        $this->client->on('open', function(ClientSession $session) use ($app) {
            $this->session = $session;
            $app->instance(ClientSession::class, $session);
            if ($this->onOpenCallback) {
                ($this->onOpenCallback)($session);
            }
        });
    }


    /**
     * @param callable $callback
     */
    public function onOpen(callable $callback) {
        $this->onOpenCallback = $callback;
    }

    /**
     * @throws \Exception
     */
    public function run()
    {
        $this->client->start();
    }

    /**
     *
     */
    public function stop()
    {
        $this->client->setAttemptRetry(false);
        $this->session->close();
    }

}