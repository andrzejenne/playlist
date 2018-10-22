<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:33
 */

namespace BBIT\Playlist\Wamp\Controllers\com;

use BBIT\Playlist\Helpers\Collection\MediaCollection;
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\MediaProvider;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Models\Playlist;
use BBIT\Playlist\Models\User;
use BBIT\Playlist\Wamp\Controllers\Controller;
use BBIT\Playlist\Wamp\WampRequest;
use BBIT\Playlist\Wamp\WampResponse;
use Illuminate\Database\Eloquent\Collection;
use Thruway\ClientSession;

/**
 * Class MediaController
 * @package BBIT\Playlist\Wamp\Controllers\com
 */
class MediaController extends Controller
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
    public function getBySid(WampRequest $request, WampResponse $response)
    {
        return $response->withJson(
            MediaCollection::create($request->getArguments())
                ->find($request->getArgument('sid')
                )
        );
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     * @throws \Exception
     */
    public function getByArtist(WampRequest $request, WampResponse $response)
    {
        return $response->withJson(
            MediaCollection::create($request->getArguments())
                ->whereArtistId($request->getArgument('aid'))
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
    public function getByAlbum(WampRequest $request, WampResponse $response)
    {
        return $response->withJson(
            MediaCollection::create($request->getArguments())
                ->whereAlbumId($request->getArgument('aid'))
                ->orderBy(Medium::COL_ALBUM_TRACK, 'ASC')
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
    public function getByGenre(WampRequest $request, WampResponse $response)
    {
        return $response->withJson(
            MediaCollection::create($request->getArguments())
                ->whereGenreId($request->getArgument('gid'))
                ->search()
                ->paginate()
                ->get()
        );
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return mixed
     * @throws \Exception
     */
    public function getByProvider(WampRequest $request, WampResponse $response)
    {
        if ($request->hasArgument('pid')) {
            $pid = $request->getArgument('pid');
        } else if ($request->hasArgument('pSlug')) {
            $pid = MediaProvider::whereSlug($request->getArgument('pSlug'))->first()->id;
        }
        if (isset($pid)) {
            return MediaCollection::create($request->getArguments())
                ->whereProviderId($pid)
                ->search()
                ->paginate()
                ->get();
        } else {
            return null;
        }
    }
}