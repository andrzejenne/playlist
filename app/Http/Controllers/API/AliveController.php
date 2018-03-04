<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:03
 */

namespace BBIT\Playlist\Http\Controllers\API;


/**
 * Class AliveController
 * @package BBIT\Playlist\Http\Controllers\API
 */
class AliveController extends Controller
{
    /**
     * @return bool
     */
    public function alive() {
        return response()->json(true);
    }
}