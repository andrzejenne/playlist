<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:33
 */

namespace BBIT\Playlist\Wamp\Controllers\com;

use BBIT\Playlist\Contracts\MediaProviderContract;
use BBIT\Playlist\Helpers\Collection\MediaCollection;
use BBIT\Playlist\Models\Album;
use BBIT\Playlist\Models\Artist;
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Services\MediaDiscoveryService;
use BBIT\Playlist\Wamp\Controllers\Controller;
use BBIT\Playlist\Providers\MediaLibraryProvider;
use Illuminate\Support\Collection;
use Thruway\ClientSession;

/**
 * Class CloudController
 * @package BBIT\Playlist\Wamp\Controllers\com
 */
class CloudController extends Controller
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
     * @return array
     * @throws \Exception
     */
    public function list($args)
    {
        return MediaCollection::create($args)
            ->search()
            ->paginate()
            ->get();
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
            $outDir = $this->mediaDiscovery->getMediumDir($provider, $medium, null);
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