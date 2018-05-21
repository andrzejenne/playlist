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
     * @param $args
     * @return array|\Illuminate\Database\Eloquent\Builder[]|\Illuminate\Database\Eloquent\Collection
     * @throws \Exception
     */
    public function artists($args)
    {
        return ArtistCollection::create($args)
            ->search()
            ->paginate()
            ->get();
    }

    /**
     * @param $args
     * @return int
     * @throws \Exception
     */
    public function artistsCount($args) {
        return ArtistCollection::create($args)
            ->count();
    }

    /**
     * @param $args
     * @return array|\Illuminate\Database\Eloquent\Builder[]|\Illuminate\Database\Eloquent\Collection
     * @throws \Exception
     */
    public function albums($args)
    {
        return AlbumCollection::create($args)
            ->search()
            ->paginate()
            ->get();
    }

    /**
     * @param $args
     * @return int
     * @throws \Exception
     */
    public function albumsCount($args) {
        return AlbumCollection::create($args)
            ->count();
    }

    /**
     * @param $args
     * @return array|\Illuminate\Database\Eloquent\Builder[]|\Illuminate\Database\Eloquent\Collection
     * @throws \Exception
     */
    public function genres($args)
    {
        return GenreCollection::create($args)
            ->search()
            ->paginate()
            ->get();
    }

    /**
     * @param $args
     * @return int
     * @throws \Exception
     */
    public function genresCount($args) {
        return GenreCollection::create($args)
            ->count();
    }

}