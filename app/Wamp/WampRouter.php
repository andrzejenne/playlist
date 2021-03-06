<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.4.18
 * Time: 21:00
 */

namespace BBIT\Playlist\Wamp;

use BBIT\Playlist\Wamp\Controllers\Controller;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Log;
use Thruway\ClientSession;
use Thruway\Peer\Client;

/**
 * Class WampRouter
 * @package BBIT\Playlist\Providers
 */
class WampRouter extends Client
{
    /**
     * @var ClientSession
     */
    protected $session;

    private $namespacePath = [];

    private $namespace = 'BBIT\Playlist\Wamp\Controllers';

    /** @var Application */
    private $app;

    /** @var Controller[] */
    private $controllers;

    /**
     * WampRouter constructor
     * @param Application $app
     */
    public function __construct(Application $app)
    {
        parent::__construct('playlist');

        $this->app = $app;
    }

    /**
     * @param ClientSession $session
     * @param \Thruway\Transport\TransportInterface $transport
     */
    public function onSessionStart($session, $transport)
    {
        parent::onSessionStart($session, $transport);

        $this->app->instance(ClientSession::class, $session);

        $this->session = $session;

        require(base_path('routes/wamp.php'));
    }


    /**
     * @param string $namespace
     * @return WampRouter
     */
    public function namespace($namespace)
    {
        $this->namespacePath[] = $namespace;

        return $this;
    }

    /**
     * @param callable $callback
     * @return WampRouter
     */
    public function group(callable $callback)
    {
        $callback();

        array_pop($this->namespacePath);

        return $this;
    }

    /**
     * @param string $cmd
     * @param callable|string $callback
     * @return WampRouter
     * @throws \Exception
     */
    public function command(string $cmd, $callback)
    {
        $this->session->register($this->getFullNamespace($cmd), $this->getCallback($callback));

        return $this;
    }

    /**
     * @param string $topic
     * @param callable|string $callback
     * @throws \Exception
     */
    public function subscribe(string $topic, $callback)
    {
        $this->session->subscribe($this->getFullNamespace($topic), $this->getCallback($callback));
    }

    /**
     * @param callable|string $callback
     * @return mixed
     * @throws \Exception
     */
    private function getCallback($callback)
    {
        if (is_string($callback)) {
            return $this->prepareCallback($callback);
        } else {
            if ($callback instanceof \Closure) {
                return $callback;
            } else {
                throw new \Exception('$callback is not callable');
            }
        }
    }

    /**
     * @param string $callback
     * @return \Closure
     */
    private function prepareCallback(string $callback)
    {
        list($cls, $method) = explode('@', $callback);
        $cls = $this->namespace . '\\' . implode('\\', array_merge($this->namespacePath, [$cls]));

        return function (...$args) use ($cls, $method) {
            $instance = $this->getController($cls);

            $response = WampResponse::create();
            try {
              // @todo - detect args by reflection
                $result = $instance->$method(WampRequest::create(...$args), $response);

                if ($result instanceof WampResponse) {
                    return $result->toArray();
                }
                else {
                    return $result;
                }
            } catch (\Throwable $t) {
                // @todo - display error
                Log::error('WampRouterError: ' . $t->getMessage());
                $this->session->publish('wamp.error', [['message' => $t->getMessage()]]);

                return false;
            }
        };
    }

    /**
     * @param string $cmd
     * @return string
     */
    private function getFullNamespace($cmd)
    {
        $full = array_merge($this->namespacePath, [$cmd]);

        return implode('.', $full);
    }

    /**
     * @param string $cls
     * @return Controller
     */
    private function getController($cls) {
        if (!isset($this->controllers[$cls])) {
            $this->controllers[$cls] = $this->app->make($cls);
        }

        return $this->controllers[$cls];
    }
}
