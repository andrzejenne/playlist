<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:33
 */

namespace BBIT\Playlist\Wamp\Controllers\com;

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
     */
    public function getBySid($args)
    {
        /** @var Medium $medium */
        $medium = Medium::whereProviderSid($args[0]->sid)
            ->with(
                Medium::REL_FILES . '.' . MediaFile::REL_TYPE,
                Medium::REL_ARTIST,
                Medium::REL_ALBUM,
                Medium::REL_GENRE,
                Medium::REL_PROVIDER
            )
            ->first();

        return $medium;
    }

    /**
     * @param $args
     * @return Medium[]|Collection
     */
    public function getByArtist($args)
    {
        return Medium::whereArtistId($args[0]->aid)
            ->with(
                Medium::REL_FILES . '.' . MediaFile::REL_TYPE,
                Medium::REL_ARTIST,
                Medium::REL_ALBUM,
                Medium::REL_GENRE,
                Medium::REL_PROVIDER
            )
            ->get();
    }

    /**
     * @param $args
     * @return Medium[]|Collection
     */
    public function getByAlbum($args)
    {
        return Medium::whereAlbumId($args[0]->aid)
            ->with(
                Medium::REL_FILES . '.' . MediaFile::REL_TYPE,
                Medium::REL_ARTIST,
                Medium::REL_ALBUM,
                Medium::REL_GENRE,
                Medium::REL_PROVIDER
            )
            ->get();
    }

    /**
     * @param $args
     * @return Medium[]|Collection
     */
    public function getByGenre($args)
    {
        return Medium::whereGenreId($args[0]->gid)
            ->with(
                Medium::REL_FILES . '.' . MediaFile::REL_TYPE,
                Medium::REL_ARTIST,
                Medium::REL_ALBUM,
                Medium::REL_GENRE,
                Medium::REL_PROVIDER
            )
            ->get();
    }

    /**
     * @param $args
     * @return mixed
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
            return Medium::whereProviderId($pid)
                ->with(
                    Medium::REL_FILES . '.' . MediaFile::REL_TYPE,
                    Medium::REL_ARTIST,
                    Medium::REL_ALBUM,
                    Medium::REL_GENRE,
                    Medium::REL_PROVIDER
                )
                ->get();
        }
        else {
            return null;
        }
    }
}