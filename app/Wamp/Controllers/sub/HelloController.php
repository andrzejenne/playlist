<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.4.18
 * Time: 21:09
 */

namespace BBIT\Playlist\Wamp\Controllers\sub;

use BBIT\Playlist\Wamp\Controllers\Controller;
use Illuminate\Support\Facades\Log;

/**
 * Class HelloClient
 * @package BBIT\Playlist\Wamp
 */
class HelloController extends Controller
{
    /**
     * @param $args
     * @param $argsKw
     * @param $details
     * @param $id
     * @return void
     */
    public function salute($args, $argsKw, $details, $id) {
        Log::info('salute:' . $args[0]->message);
    }

}