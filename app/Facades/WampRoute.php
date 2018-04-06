<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 5.4.18
 * Time: 9:37
 */

namespace BBIT\Playlist\Facades;


use Illuminate\Support\Facades\Facade;

/**
 * Class WampRoute
 * @package BBIT\Playlist\Facades
 */
class WampRoute extends Facade
{
    protected static function getFacadeAccessor() { return 'wamp'; }
}