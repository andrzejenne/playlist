<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:33
 */

namespace BBIT\Playlist\Http\Controllers\API;

use Illuminate\Http\Request;
use BBIT\Playlist\Providers\MediaLibraryProvider;
use BBIT\Playlist\Models\Search;

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

            // @todo - repository
            $search = Search::whereQuery($query)->first();
            if (!$search) {
                $search = new Search();
                $search->fill(['query' => $query]);
                $search->user_id = 1;
                $search->save();
            } else {
                $search->save(); // updates updated at
            }
        }

        return response()->json($results);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function list()
    {
        // @todo - implement authentication, id should be authenticated user id
        // @todo - repository
        return response()->json(
            Search::whereUserId(1)
                ->orderBy(Search::COL_UPDATED_AT, 'DESC')
                ->get()
                ->toArray()
        );
    }

    /**
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete($id)
    {
        $result = Search::whereId($id)->delete();

        return response()->json(['status' => $result]);
    }
}