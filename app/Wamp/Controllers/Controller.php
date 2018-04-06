<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 5.4.18
 * Time: 13:01
 */

namespace BBIT\Playlist\Wamp\Controllers;

use Thruway\ClientSession;


/**
 * Class Controller
 * @package BBIT\Playlist\Wamp\Controllers
 */
class Controller extends \Illuminate\Routing\Controller
{
    /** @var ClientSession */
    protected $session;

    /**
     * Controller constructor.
     * @param ClientSession $session
     */
    public function __construct(ClientSession $session)
    {
        $this->session = $session;
    }


}