<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['web', \Barryvdh\Cors\HandleCors::class])->get('/user', function (Request $request) {
    $user = $request->user();
    if ($user) {
        return response()->json($user);
    }

    $token = $request->get('token');
    try {
        if (($json = Storage::get($token . '.json'))) {
            Storage::delete($token . '.json');

            return $json;
        }
    }
    finally {
        return '{}';
    }
});

Route::namespace('API')->group(function () {
    Route::get('/alive', 'AliveController@alive');
    Route::get('/info', function () {
        phpinfo();
    });

//    Route::namespace('youtube')

    Route::get('/search', 'SearchController@search');
    Route::get('/search/list', 'SearchController@list');
    Route::delete('/search/list/{id}', 'SearchController@delete');

    Route::get('/info/{sid}', 'InfoController@info');

    Route::get('/download/{sid}', 'YoutubeDownloadController@download');
});
