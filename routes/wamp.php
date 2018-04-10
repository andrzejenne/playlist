<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.4.18
 * Time: 21:05
 */

WampRoute::namespace('com')->group(function(){
    WampRoute::command('hello.world', 'HelloController@sayHello');
    WampRoute::command('search', 'SearchController@search');
    WampRoute::command('search.list', 'SearchController@list');
    WampRoute::command('search.list.delete', 'SearchController@delete');
});

WampRoute::namespace('sub')->group(function(){
    WampRoute::subscribe('say.hi', 'HelloController@salute');
});
