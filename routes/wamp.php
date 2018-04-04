<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.4.18
 * Time: 21:05
 */

/** @var \BBIT\Playlist\Providers\WampRouter $this */

WampRoute::namespace('com')->group(function(){
    WampRoute::command('hello.world', 'HelloController@sayHello');
});
