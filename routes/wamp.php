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

    WampRoute::command('cloud.list', 'CloudController@list');
    WampRoute::command('cloud.remove', 'CloudController@remove');

    WampRoute::command('playlists.list', 'PlaylistsController@list');
    WampRoute::command('playlists.create', 'PlaylistsController@create');
    WampRoute::command('playlists.media', 'PlaylistsController@media');
    WampRoute::command('playlists.remove', 'PlaylistsController@remove');
    WampRoute::command('playlists.addMedium', 'PlaylistsController@addMedium');
    WampRoute::command('playlists.removeMedium', 'PlaylistsController@removeMedium');
    WampRoute::command('playlists.order', 'PlaylistsController@order');

    WampRoute::command('library.albums', 'LibraryController@albums');
    WampRoute::command('library.artists', 'LibraryController@artists');
    WampRoute::command('library.genres', 'LibraryController@genres');
    WampRoute::command('library.albumsCount', 'LibraryController@albumsCount');
    WampRoute::command('library.artistsCount', 'LibraryController@artistsCount');
    WampRoute::command('library.genresCount', 'LibraryController@genresCount');

    WampRoute::command('media.getBySid', 'MediaController@getBySid');
    WampRoute::command('media.getByArtist', 'MediaController@getByArtist');
    WampRoute::command('media.getByAlbum', 'MediaController@getByAlbum');
    WampRoute::command('media.getByGenre', 'MediaController@getByGenre');
    WampRoute::command('media.getByProvider', 'MediaController@getByProvider');

    WampRoute::command('app.providers', 'AppController@providers');
});

WampRoute::namespace('sub')->group(function(){
    WampRoute::subscribe('say.hi', 'HelloController@salute');
});
