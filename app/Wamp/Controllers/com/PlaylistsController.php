<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:33
 */

namespace BBIT\Playlist\Wamp\Controllers\com;

use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Models\Playlist;
use BBIT\Playlist\Wamp\Controllers\Controller;
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
     * @param $args
     * @return \Illuminate\Http\JsonResponse
     */
    public function list($args)
    {
        return Playlist::whereUserId($args[0]->uid)
            ->orderBy(Playlist::COL_NAME, 'ASC')
            ->get();
    }

    /**
     * @param $args
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function media($args)
    {
        /** @var Playlist $playlist */
        $playlist = Playlist::whereId($args[0]->pid)
            ->first();

        return $playlist->media()
            ->with(Medium::REL_FILES . '.' . MediaFile::REL_TYPE)->get();

    }

    /**
     * @param $args
     * @return bool
     */
    public function add($args)
    {
        /** @var Playlist $playlist */
        $playlist = Playlist::whereId($args[0]->pid)
            ->first();

        $playlist->media()->attach($args[0]->mid, ['ordering' => $args[0]->ordering]);

        return true;
        // @todo - reorder
    }

    /**
     * @param $args
     * @return int
     */
    public function remove($args)
    {
        /** @var Playlist $playlist */
        $playlist = Playlist::whereId($args[0]->pid)
            ->first();

        return $playlist->media()->detach($args[0]->mid);

        // @todo - reorder
    }

    /**
     * @param $args
     * @return int
     */
    public function order($args) {
        /** @var Playlist $playlist */
        $playlist = Playlist::whereId($args[0]->pid)
            ->first();

        return $playlist->media()->updateExistingPivot($args[0]->mid, ['ordering' => $args[0]->ordering]);
    }
}