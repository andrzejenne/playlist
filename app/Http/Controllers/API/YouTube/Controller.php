<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:33
 */

namespace BBIT\Playlist\Http\Controllers\API\YouTube;

use Alaouy\Youtube\Facades\Youtube;
use Illuminate\Http\Request;

/**
 * Class Controller
 * @package BBIT\Playlist\Http\Controllers\API\YouTube
 */
class Controller extends \BBIT\Playlist\Http\Controllers\API\Controller
{

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $results = [];
        $q = $request->query('q');

        if (!empty($q) && strlen($q) > 1) {
            $results = Youtube::paginateResults([
                'q' => $q,
                'part' => 'id, snippet'
            ]);

            $results = response()->json($results);
        }

        return response()->json($results);
    }
}