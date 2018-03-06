<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:33
 */

namespace BBIT\Playlist\Http\Controllers\API;

use BBIT\Playlist\Providers\MediaLibraryProvider;
use Illuminate\Http\Request;

/**
 * Class Controller
 * @package BBIT\Playlist\Http\Controllers\API\YouTube
 */
class SearchController extends Controller
{

    /**
     * @param Request $request
     * @param MediaLibraryProvider $libraryProvider
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request, MediaLibraryProvider $libraryProvider)
    {
        $service = $libraryProvider->getService();

        $query = $request->input('q');

        $results = [];

        if (!empty($query)) {
            $results = $service->search($query);
        }

        return response()->json($results);
    }
}