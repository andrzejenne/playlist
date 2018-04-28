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
    WampRoute::command('downloaded.list', 'DownloadedController@list');

    WampRoute::command('playlists.list', 'PlaylistsController@list');
    WampRoute::command('playlists.create', 'PlaylistsController@create');
    WampRoute::command('playlists.media', 'PlaylistsController@media');
    WampRoute::command('playlists.add', 'PlaylistsController@add');
    WampRoute::command('playlists.remove', 'PlaylistsController@remove');
    WampRoute::command('playlists.order', 'PlaylistsController@order');

    WampRoute::command('media.getBySid', 'MediaController@getBySid');
});

WampRoute::namespace('sub')->group(function(){
    WampRoute::subscribe('say.hi', 'HelloController@salute');
});
