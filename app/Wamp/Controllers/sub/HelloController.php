<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.4.18
 * Time: 21:09
 */

namespace BBIT\Playlist\Wamp\Controllers\sub;

use BBIT\Playlist\Wamp\Controllers\Controller;
use BBIT\Playlist\Wamp\WampRequest;
use BBIT\Playlist\Wamp\WampResponse;
use Illuminate\Support\Facades\Log;

/**
 * Class HelloClient
 * @package BBIT\Playlist\Wamp
 */
class HelloController extends Controller
{
  /**
   * @param WampRequest $request
   * @param WampResponse $response
   * @return void
   */
    public function salute(WampRequest $request, WampResponse $response) {
        Log::info('salute:' . $request->getArgument('message'));
    }

}