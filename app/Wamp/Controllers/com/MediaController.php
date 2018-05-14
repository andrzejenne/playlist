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
     */
    public function getBySid($args)
    {
        /** @var Medium $medium */
        $medium = Medium::whereProviderSid($args[0]->sid)
            ->first();

        return $medium;
    }

    /**
     * @param $args
     * @return Medium[]|Collection
     */
    public function getByArtist($args) {
        return Medium::whereArtistId($args[0]->aid)
            ->get();
    }

    /**
     * @param $args
     * @return Medium[]|Collection
     */
    public function getByAlbum($args) {
        return Medium::whereAlbumId($args[0]->aid)
            ->get();
    }

    /**
     * @param $args
     * @return Medium[]|Collection
     */
    public function getByGenre($args) {
        return Medium::whereGenreId($args[0]->gid)
            ->get();
    }
}