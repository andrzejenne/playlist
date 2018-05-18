<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:33
 */

namespace BBIT\Playlist\Wamp\Controllers\com;

use BBIT\Playlist\Helpers\Collection\AlbumCollection;
use BBIT\Playlist\Models\Album;
use BBIT\Playlist\Models\Artist;
use BBIT\Playlist\Models\Genre;
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Models\Playlist;
use BBIT\Playlist\Models\User;
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
     * @return \Illuminate\Http\JsonResponse
     */
    public function artists($args)
    {
        return Artist::orderBy(Artist::COL_NAME, 'ASC')
            ->get();
    }

    /**
     * @param $args
     * @return \Illuminate\Http\JsonResponse
     * @throws \Exception
     */
    public function albums($args)
    {
        return AlbumCollection::create($args)
            ->get();
    }


    /**
     * @param $args
     * @return \Illuminate\Http\JsonResponse
     */
    public function genres($args)
    {
        return Genre::orderBy(Genre::COL_NAME, 'ASC')
            ->get();
    }

}