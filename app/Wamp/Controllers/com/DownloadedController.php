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
use BBIT\Playlist\Wamp\Controllers\Controller;
use BBIT\Playlist\Providers\MediaLibraryProvider;
use BBIT\Playlist\Models\Search;
use Thruway\ClientSession;

/**
 * Class DownloadedController
 * @package BBIT\Playlist\Wamp\Controllers\com
 */
class DownloadedController extends Controller
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
     * @param $args
     * @return Medium[]|\Illuminate\Database\Eloquent\Builder[]|\Illuminate\Database\Eloquent\Collection
     */
    public function list($args)
    {
        $data = Medium::with([
            Medium::REL_PROVIDER,
            Medium::REL_FILES,
            Medium::REL_FILES . '.' . MediaFile::REL_TYPE
        ]);

        return $data->get();
    }
}