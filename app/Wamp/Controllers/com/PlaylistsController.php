<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:33
 */

namespace BBIT\Playlist\Wamp\Controllers\com;

use BBIT\Playlist\Helpers\Collection\MediaCollection;
use BBIT\Playlist\Helpers\Collection\PlaylistCollection;
use BBIT\Playlist\Models\Playlist;
use BBIT\Playlist\Models\User;
use BBIT\Playlist\Wamp\Controllers\Controller;
use BBIT\Playlist\Wamp\WampRequest;
use BBIT\Playlist\Wamp\WampResponse;
use Thruway\ClientSession;

/**
 * Class PlaylistsController
 * @package BBIT\Playlist\Wamp\Controllers\com
 */
class PlaylistsController extends Controller
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
    public function list(WampRequest $request, WampResponse $response)
    {
        $playlists = PlaylistCollection::create($request->getArguments())
            ->whereUserId($request->getArgument('uid'))
            ->orderBy(Playlist::COL_NAME, 'ASC')
            ->get();

        return $response->withJson(
            $playlists
        );

    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     * @deprecated
     */
    public function media(WampRequest $request, WampResponse $response)
    {
        /** @var Playlist $playlist */
        $playlist = PlaylistCollection::create($request->getArguments())
            ->whereId(
                $request->getArgument('pid')
            )
            ->first();

        return $response->withJson(
                $playlist->media()
                ->get()
        );

    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     */
    public function create(WampRequest $request, WampResponse $response)
    {
        $user = User::whereId(
            $request->getArgument('uid')
        )->first();

        if ($user) {
            $playlist = new Playlist([
                Playlist::COL_NAME => $request->getArgument('name')
            ]);

            $playlist->user()->associate($user);

            $playlist->save();

            return $response->withJson(
                $playlist
            );
        }

        return $response->withJson();
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     * @throws \Exception
     */
    public function remove(WampRequest $request, WampResponse $response)
    {
        /** @var Playlist $playlist */
        $playlist = Playlist::whereId(
            $request->getArgument('pid')
        )
            ->first();

        return $response->withJson(
            $playlist->delete()
        );
        // @todo - reorder
    }


    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     * @throws \Exception
     */
    public function addMedium(WampRequest $request, WampResponse $response)
    {
        /** @var Playlist $playlist */
        $playlist = Playlist::whereId($request->getArgument('pid'))
            ->first();

        $playlist->media()
            ->attach(
                $request->getArgument('mid'),
                [
                    'ordering' => $request->hasArgument('ordering') ? $request->getArgument('ordering') : 0
                ]);

        return $response->withJson(
            MediaCollection::create($request->getArguments())
                ->whereId(
                    $request->getArgument('mid')
                )
                ->first()
        );
        // @todo - reorder
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     */
    public function removeMedium(WampRequest $request, WampResponse $response)
    {
        /** @var Playlist $playlist */
        $playlist = Playlist::whereId($request->getArgument('pid'))
            ->first();

        return $response->withJson(
            $playlist->media()->detach($request->getArgument('mid'))
        );

        // @todo - reorder
    }

    /**
     * @param WampRequest $request
     * @param WampResponse $response
     * @return WampResponse
     */
    public function order(WampRequest $request, WampResponse $response)
    {
        /** @var Playlist $playlist */
        $playlist = Playlist::whereId($request->getArgument('pid'))
            ->first();

        return $response->withJson(
            $playlist->media()
                ->updateExistingPivot($request->getArgument('mid'), [
                    'ordering' => $request->getArgument('ordering')
                ])
        );
    }
}