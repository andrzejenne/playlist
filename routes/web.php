<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', 'PlaylistController@index');

Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');

// Social Auth
Route::get('/auth/social', 'Auth\SocialAuthController@show')->name('social.login');
Route::get('/oauth/{driver}', 'Auth\SocialAuthController@redirectToProvider')->name('social.oauth');
Route::get('/oauth/{driver}/callback', 'Auth\SocialAuthController@handleProviderCallback')->name('social.callback');

// Media Streamer
Route::get('/media/{id}/{fid}', 'MediaStreamController@stream');

Route::get('/covers/{cid}', 'CoversController@get');
Route::get('/thumbnails/{mid}/{fid}', 'CoversController@getThumbnail');