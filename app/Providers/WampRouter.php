<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.4.18
 * Time: 21:00
 */

namespace BBIT\Playlist\Providers;

use App;
use Thruway\ClientSession;
use Thruway\Peer\Client;

/**
 * Class WampRouter
 * @package BBIT\Playlist\Providers
 */
class WampRouter extends Client
{

    private $ns = [];
    /**
     * @var ClientSession
     */
    private $session;

    // @todo - dokoncit
    private $app;

    /**
     * WampRouter constructor
     * @param ClientSession $session
     */
    public function __construct(ClientSession $session = null)
    {
        parent::__construct('playlist');

        $this->setSession($session);

        $this->app = \App::getInstance();
    }

    /**
     * @param ClientSession $session
     * @return $this
     */
    public function setSession(ClientSession $session)
    {
        $this->session = $session;

        return $this;
    }


    /**
     * @param $ns
     * @param $callback
     * @return WampRouter
     */
    public function namespace($ns, $callback)
    {
        $this->ns[] = $ns;

        $callback();

        array_pop($this->ns);

        return $this;
    }

    /**
     * @param $cmd
     * @param $callback
     * @return WampRouter
     */
    public function command($cmd, $callback)
    {
        $this->session->register($this->getFullNamespace($cmd), $this->getCallback($callback));

        return $this;
    }

    /**
     * @param $topic
     * @param $callback
     */
    public function subscription($topic, $callback) {
        $this->session->subscribe($topic, $this->getCallback($callback));
    }

    /**
     * @param $callback
     * @return mixed
     */
    private function getCallback($callback) {
        if (is_string($callback)) {
            return $this->prepareCallback($callback);
        }

        return $callback;
    }

    /**
     * @param string $callback
     */
    private function prepareCallback(string $callback) {

    }

    /**
     * @param $cmd
     * @return string
     */
    private function getFullNamespace($cmd)
    {
        $full = array_merge($this->ns, [$cmd]);

        return implode('.', $full);
    }
}