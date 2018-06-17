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
use BBIT\Playlist\Wamp\WampRequest;
use BBIT\Playlist\Wamp\WampResponse;
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
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     */
    public function search(WampRequest $request, WampResponse $response)
    {
        $provider = $request->getArgument('provider');

        $service = $this->libraryProvider->getService($provider);

        $query = $request->getArgument('q');
        $pageToken = $request->getArgument('pageToken');
        $perPage = $request->getArgument('perPage', 8);

        $results = [];

        if (!empty($query)) {
            $results = $service->search($query, $perPage, $pageToken);

            // @todo - repository
            $search = Search::whereQuery($query)->first();
            if (!$search) {
                $search = new Search();
                $search->fill(['query' => $query]);
                $search->user_id = $request->getArgument('uid');
            }
            $search->save();
        }

        return $response->withJson($results);
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     */
    public function list(WampRequest $request, WampResponse $response)
    {
        // @todo - implement authentication, id should be authenticated user id
        // @todo - repository
        // @todo - test for required arguments
        return $response->withJson(
            Search::whereUserId($request->getArgument('uid'))
            ->orderBy(Search::COL_UPDATED_AT, 'DESC')
            ->get()
        );
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     */
    public function delete(WampRequest $request, WampResponse $response)
    {
        // @todo - test for required arguments
        $result = Search::whereId(
            $request->getArgument('id')
        )->delete();

        return $response->withJson($result);
    }
}