<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 26.4.18
 * Time: 14:48
 */

namespace BBIT\Playlist\Http\Controllers;

use BBIT\Playlist\Models\Cover;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Services\CoversService;
use BBIT\Playlist\Services\ImageRequestProcessor;
use BBIT\Playlist\Services\MediaDiscoveryService;
use function GuzzleHttp\Psr7\mimetype_from_filename;
use Illuminate\Http\Request;

/**
 * Class CoversController
 * @package BBIT\Playlist\Http\Controllers
 * @author Andrzej Heczko
 */
class CoversController
{
    /** @var CoversService */
    private $coversService;

    /** @var MediaDiscoveryService */
    private $discoverService;
    /**
     * @var ImageRequestProcessor
     */
    private $imageRequestProcessor;

    /**
     * MediaStreamController constructor.
     * @param CoversService $coversService
     * @param MediaDiscoveryService $discoveryService
     * @param ImageRequestProcessor $imageRequestProcessor
     */
    public function __construct(
        CoversService $coversService,
        MediaDiscoveryService $discoveryService,
        ImageRequestProcessor $imageRequestProcessor
    )
    {
        $this->coversService = $coversService;
        $this->discoverService = $discoveryService;
        $this->imageRequestProcessor = $imageRequestProcessor;
    }


    /**
     * @param $cid
     * @param Request $request
     * @return bool|string
     */
    public function get($cid, Request $request)
    {
        $cover = Cover::whereId($cid)->first();
        if (!$cover) {
            return response('Cover Not Found', 404);
        }

        $album = $cover->album;

        $path = $this->coversService->getCoverPath($album, $cover->type);

        if (\File::exists($path)) {
            return $this->imageRequestProcessor->process($path, $request);
//            return response(\File::get($path), 200, $this->getHeadersForPath($path));
        }

        return response('File Not Found', 404);
    }

    /**
     * @param $mid
     * @param $fid
     * @param Request $request
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     */
    public function getThumbnail($mid, $fid, Request $request)
    {
        $medium = Medium::whereId($mid)->first();
        if (!$medium) {
            return response('Medium not found', 404);
        }
        $file = $medium->files()->whereId($fid)->first();
        if (!$file) {
            return response('File not found', 404);
        }

        if ($file->type->slug !== 'thumbnail') {
            return response('Thumbnail not found', 404);
        }

        $path = $this->discoverService->getFilePath($mid, $fid);

        if (\File::exists($path)) {
            return $this->imageRequestProcessor->process($path, $request);
//            return response(\File::get($path), 200, $this->getHeadersForPath($path));
        }

        return response('File not found', 404);
    }
}