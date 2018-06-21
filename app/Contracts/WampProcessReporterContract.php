<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 17:17
 */

namespace BBIT\Playlist\Contracts;

use BBIT\Playlist\Helpers\Process;
use Thruway\ClientSession;

/**
 * Class ProcessReporterContract
 * @package BBIT\Playlist\Contracts
 */
abstract class WampProcessReporterContract extends ProcessReporterContract
{
    /** @var ClientSession */
    private $session;

    /**
     *
     */
    function restart() {
        $this->progress = 0;
        $this->finished = false;
        $this->started = false;
    }

    /**
     * WampProcessReporterContract constructor.
     * @param ClientSession $session
     */
    public function __construct(ClientSession $session)
    {
        $this->setSession($session);
    }


    /**
     * @param ClientSession $session
     * @return WampProcessReporterContract
     */
    final public function setSession(ClientSession $session)
    {
        $this->session = $session;

        return $this;
    }

    /**
     * @param string $event
     * @param null|mixed $args
     */
    final protected function reportEvent(string $event, $args = null)
    {
        $this->session->publish('sub.' . $event, [$args]); //, [], ["acknowledge" => true])
//        $this->session->getLoop()->tick();
//            ->then(
//                function () {
//                    echo "Publish Acknowledged!\n";
//                },
//                function ($error) {
//                    // publish failed
//                    echo "Publish Error {$error}\n";
//                }
//            );;
    }

}