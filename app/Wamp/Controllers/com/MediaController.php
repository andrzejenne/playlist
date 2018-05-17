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
     * @param $args
     * @return Medium
     * @throws \Exception
     */
    public function getBySid($args)
    {
        return MediaCollection::create($args)
            ->find($args[0]->sid);
    }

    /**
     * @param $args
     * @return Medium[]|Collection
     * @throws \Exception
     */
    public function getByArtist($args)
    {
        return MediaCollection::create($args)
            ->whereArtistId($args[0]->aid)
            ->search()
            ->paginate();
    }

    /**
     * @param $args
     * @return Medium[]|Collection
     * @throws \Exception
     */
    public function getByAlbum($args)
    {
        return MediaCollection::create($args)
            ->whereAlbumId($args[0]->aid)
            ->search()
            ->paginate();
    }

    /**
     * @param $args
     * @return Medium[]|Collection
     * @throws \Exception
     */
    public function getByGenre($args)
    {
        return MediaCollection::create($args)
            ->whereGenreId($args[0]->gid)
            ->search()
            ->paginate();
    }

    /**
     * @param $args
     * @return mixed
     * @throws \Exception
     */
    public function getByProvider($args)
    {
        if (isset($args[0]->pid)) {
            $pid = $args[0]->pid;
        }
        else if (isset($args[0]->pSlug)) {
            $pid =  MediaProvider::whereSlug($args[0]->pSlug)->first()->id;
        }
        if (isset($pid)) {
            return MediaCollection::create($args)
                ->whereProviderId($pid)
                ->search()
                ->paginate()
                ->get();
        }
        else {
            return null;
        }
    }
}