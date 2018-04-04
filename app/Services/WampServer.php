<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.4.18
 * Time: 17:28
 */

namespace BBIT\Playlist\Services;


use Askedio\LaravelRatchet\RatchetWampServer;
use Ratchet\ConnectionInterface;

/**
 * Class WampServer
 * @package BBIT\Playlist\Services
 */
class WampServer extends RatchetWampServer
{
    /**
     * @param ConnectionInterface $conn
     * @throws \Exception
     */
    public function onOpen(ConnectionInterface $conn)
    {
        parent::onOpen($conn); // TODO: Change the autogenerated stub

        echo "opened";
    }


}