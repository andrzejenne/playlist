<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:33
 */

namespace BBIT\Playlist\Wamp\Controllers\com;

use BBIT\Playlist\Contracts\MediaProviderContract;
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Services\MediaDiscoveryService;
use BBIT\Playlist\Wamp\Controllers\Controller;
use BBIT\Playlist\Providers\MediaLibraryProvider;
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
     * @var MediaDiscoveryService
     */
    private $mediaDiscovery;

    /**
     * SearchController constructor.
     * @param ClientSession $session
     * @param MediaLibraryProvider $libraryProvider
     * @param MediaDiscoveryService $mediaDiscovery
     */
    public function __construct(ClientSession $session, MediaLibraryProvider $libraryProvider, MediaDiscoveryService $mediaDiscovery)
    {
        parent::__construct($session);

        $this->libraryProvider = $libraryProvider;
        $this->mediaDiscovery = $mediaDiscovery;
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
            Medium::REL_FILES . '.' . MediaFile::REL_TYPE,
            Medium::REL_ALBUM,
            Medium::REL_ARTIST
        ]);

//        $limit = isset($args[0]->limit) ? $args[0]->limit : 100;
//        $offset = isset($args[0]->offset) ? $args[0]->offset : 0;
        $limit = 100;
        $offset = 0;

        return $data->paginate($limit, '*', 'page', floor($offset / $limit) + 1)->items();
    }

    /**
     * @param $args
     * @return int
     * @throws \Exception
     */
    public function remove($args)
    {
        /** @var Medium $medium */
        $medium = Medium::whereId($args[0]->mid)
            ->first();

        /** @var MediaProviderContract $provider */
        $provider = $medium->provider->getService();
//        try {
        if ($provider->canDelete()) {
            $outDir = $this->mediaDiscovery->getMediumDir($provider, $medium);
            if (true === \File::deleteDirectory($outDir)) {
                if (!\File::exists($outDir)) {
                    return $medium->delete();
                }
            }
        }

        return 0;
//        } catch (\Exception $e) {
//            return ['error' => true, 'message' => $e->getMessage()];
//        }
        // @todo - reorder
    }

}