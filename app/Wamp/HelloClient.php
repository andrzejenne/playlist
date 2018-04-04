<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.4.18
 * Time: 21:09
 */

namespace BBIT\Playlist\Wamp;


use Thruway\Peer\Client;
use Thruway\Peer\ClientInterface;

/**
 * Class HelloClient
 * @package BBIT\Playlist\Wamp
 */
class HelloClient extends Client implements ClientInterface
{
    /**
     * HelloClient constructor.
     */
    public function __construct()
    {
        parent::__construct("playlist");
    }

    /**
     * @param \Thruway\ClientSession $session
     * @param \Thruway\Transport\TransportInterface $transport
     */
    public function onSessionStart($session, $transport)
    {
        $session->register('playlist.hello', [$this, 'helloWorld']);
    }

    /**
     * @return void
     */
    public function helloWorld() {
//        return ['HelloWorld'];
//        $this->session->call('playlist.hi');
        $this->session->publish('playlist.hi', [['message' => 'hi you there'], 'haha', 'hihi'], [], []);
    }

}