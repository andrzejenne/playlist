<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 26.4.18
 * Time: 14:48
 */

namespace BBIT\Playlist\Http\Controllers;

use BBIT\Playlist\Helpers\Str;
use BBIT\Playlist\Models\Cover;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Services\CoversService;
use BBIT\Playlist\Services\MediaDiscoveryService;
use function GuzzleHttp\Psr7\mimetype_from_extension;
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
     * MediaStreamController constructor.
     * @param CoversService $coversService
     * @param MediaDiscoveryService $discoveryService
     */
    public function __construct(CoversService $coversService, MediaDiscoveryService $discoveryService)
    {
        $this->coversService = $coversService;
        $this->discoverService = $discoveryService;
    }


    /**
     * @param $cid
     * @return bool|string
     * @throws \Exception
     */
    public function get($cid)
    {
        $cover = Cover::whereId($cid)->first();
        if (!$cover) {
            return response('Cover Not Found', 404);
        }

        $album = $cover->album;

        $path = $this->coversService->getCoverPath($album, $cover->type);

        if (\File::exists($path)) {
            return response(\File::get($path), 200, $this->getHeadersForPath($path));
        }

        return response('File Not Found', 404);
    }

    /**
     * @param $mid
     * @param $fid
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     */
    public function getThumbnail($mid, $fid)
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
            return response(\File::get($path), 200, $this->getHeadersForPath($path));
        }

        return response('File not found', 404);
    }

    private function getHeadersForPath($path) {
        return [
            'Content-Type' => mimetype_from_filename($path),
            'Content-Length' => \File::size($path)
            // @todo - expiration
        ];
    }
}