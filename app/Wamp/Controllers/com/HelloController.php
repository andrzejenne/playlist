<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.4.18
 * Time: 21:09
 */

namespace BBIT\Playlist\Wamp\Controllers\com;

use BBIT\Playlist\Wamp\Controllers\Controller;

/**
 * Class HelloClient
 * @package BBIT\Playlist\Wamp
 */
class HelloController extends Controller
{
    /**
     * @return string;
     */
    public function sayHello() {
        $this->session->publish('playlist.hi', [['message' => 'hi you there'], 'haha', 'hihi'], [], []);

        return 'said hello to playlist.hi';
    }

}