<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:33
 */

namespace BBIT\Playlist\Wamp\Controllers\com;

use BBIT\Playlist\Helpers\Collection\AlbumCollection;
use BBIT\Playlist\Helpers\Collection\ArtistCollection;
use BBIT\Playlist\Helpers\Collection\GenreCollection;
use BBIT\Playlist\Wamp\Controllers\Controller;
use BBIT\Playlist\Wamp\WampRequest;
use BBIT\Playlist\Wamp\WampResponse;
use Thruway\ClientSession;

/**
 * Class LibraryController
 * @package BBIT\Playlist\Wamp\Controllers\com
 */
class LibraryController extends Controller
{

    /**
     * SearchController constructor.
     * @param ClientSession $session
     */
    public function __construct(ClientSession $session)
    {
        parent::__construct($session);
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     * @throws \Exception
     */
    public function artists(WampRequest $request, WampResponse $response)
    {
        return $response->withJson(
            ArtistCollection::create($request->getArguments())
                ->search()
                ->paginate()
                ->get()
        );
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     * @throws \Exception
     */
    public function artistsCount(WampRequest $request, WampResponse $response)
    {
        return $response->withJson(
            ArtistCollection::create($request->getArguments())
                ->count()
        );
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     * @throws \Exception
     */
    public function albums(WampRequest $request, WampResponse $response)
    {
        return $response->withJson(
            AlbumCollection::create($request->getArguments())
                ->search()
                ->paginate()
                ->get()
        );
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     * @throws \Exception
     */
    public function albumsCount(WampRequest $request, WampResponse $response)
    {
        return $response->withJson(
            AlbumCollection::create($request->getArguments())
                ->count()
        );
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     * @throws \Exception
     */
    public function genres(WampRequest $request, WampResponse $response)
    {
        return $response->withJson(
            GenreCollection::create($request->getArguments())
                ->search()
                ->paginate()
                ->get()
        );
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     * @throws \Exception
     */
    public function genresCount(WampRequest $request, WampResponse $response)
    {
        return $response->withJson(
            GenreCollection::create($request->getArguments())
                ->count()
        );
    }

}