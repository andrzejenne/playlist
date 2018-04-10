<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:33
 */

namespace BBIT\Playlist\Wamp\Controllers\com;

use BBIT\Playlist\Wamp\Controllers\Controller;
use BBIT\Playlist\Providers\MediaLibraryProvider;
use BBIT\Playlist\Models\Search;
use Thruway\ClientSession;

/**
 * Class Controller
 * @package BBIT\Playlist\Http\Controllers\API\YouTube
 */
class SearchController extends Controller
{
    /**
     * @var MediaLibraryProvider
     */
    private $libraryProvider;

    /**
     * SearchController constructor.
     * @param ClientSession $session
     * @param MediaLibraryProvider $libraryProvider
     */
    public function __construct(ClientSession $session, MediaLibraryProvider $libraryProvider)
    {
        parent::__construct($session);

        $this->libraryProvider = $libraryProvider;
    }


    /**
     * @param $args
     * @return array
     */
    public function search($args)
    {
        $service = $this->libraryProvider->getService();

        $query = $args[0]->q;
        $pageToken = getValue($args[0]->pageToken);
        $perPage = getValue($args[0]->perPage, 8);

        $results = [];

        if (!empty($query)) {
            $results = $service->search($query, $perPage, $pageToken);

            // @todo - repository
            $search = Search::whereQuery($query)->first();
            if (!$search) {
                $search = new Search();
                $search->fill(['query' => $query]);
                $search->user_id = $args[0]->uid;
                $search->save();
            }
            else {
                $search->save(); // updates updated at
            }
        }

        return $results;
    }

    /**
     * @param $args
     * @return \Illuminate\Http\JsonResponse
     */
    public function list($args)
    {
        // @todo - implement authentication, id should be authenticated user id
        // @todo - repository
        return Search::whereUserId($args[0]->uid)
            ->orderBy(Search::COL_UPDATED_AT, 'DESC')
            ->get();
    }

    /**
     * @param $args
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete($args)
    {
        $result = Search::whereId($args[0]->id)->delete();

        return $result;
    }
}