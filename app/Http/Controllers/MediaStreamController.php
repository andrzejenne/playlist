<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 26.4.18
 * Time: 14:48
 */

namespace BBIT\Playlist\Http\Controllers;

use BBIT\Playlist\Helpers\Str;
use BBIT\Playlist\Services\MediaDiscoveryService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\ResponseFactory;

/**
 * Class MediaStreamController
 * @package BBIT\Playlist\Http\Controllers
 * @author Andrzej Heczko
 * @source https://laravel.io/forum/10-06-2014-streaming-video-files-with-laravel
 */
class MediaStreamController
{
    /** @var MediaDiscoveryService */
    private $mediaDiscoveryService;

    /**
     * MediaStreamController constructor.
     * @param MediaDiscoveryService $mediaDiscoveryService
     */
    public function __construct(MediaDiscoveryService $mediaDiscoveryService)
    {
        $this->mediaDiscoveryService = $mediaDiscoveryService;
    }


    /**
     * @param string $id
     * @param string $fid
     * @param Request $request
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    public function stream(string $id, string $fid, Request $request)
    {
        $path = $this->mediaDiscoveryService->getFilePath((int)$id, (int)$fid);
        if ($path) {
//            echo $path;
            $type = \File::mimeType($path);
            if ($type) {
                $size = \File::size($path);
                $start = 0;
                $end = $size - 1;
                $headers = [
                    'Content-Type' => $type,
                    'Cache-Control' => 'max-age=2592000, public',
                    'Expires' => gmdate('D, d M Y H:i:s', time() + 2592000) . ' GMT',
                    'Last-Modified' => gmdate('D, d M Y H:i:s', \File::lastModified($path)) . ' GMT',
                    'Accept-Ranges' => '0-' . $end
                ];

                if ($request->hasHeader('Range')) {
                    list(, $range) = explode('=', $request->server('HTTP_RANGE'), 2);
                    $headers += ["Content-Range" => "bytes $start-$end/$size"];

                    if (strpos($range, ',') !== false) {
                        return response('', 416, $headers);
                    }

                    $cEnd = $end;
                    if ($range == '-') {
                        $cStart = $size - substr($range, 1);
                    } else {
                        $range = explode('-', $range);
                        $cStart = $range[0];

                        if ($cStart > 0) {
                            $memUsage = memory_get_usage(true);
                            $maxMem = Str::toBytes(ini_get('memory_limit'));
                            if ($maxMem < $memUsage) {
                                $range[1] = $cStart + 512000;
                            } else {
                                // to avoid max mem usage fail
                                $range[1] = min($cStart + ceil(($maxMem - $memUsage)) / 8, $range[1]);
                            }
                            $cEnd = (isset($range[1]) && is_numeric($range[1])) ? $range[1] : $cStart + 102400; // $cEnd;
                        } else {
                            $cEnd = $cStart + 512000;
                        }
                    }
                    $cEnd = ($cEnd > $end) ? $end : $cEnd;
                    if ($cStart > $cEnd || $cStart > $end || $cEnd >= $size) {
                        return response('', 416, $headers);
                    }

                    $length = $cEnd - $cStart + 1;
                    $stream = fopen($path, 'rb');
                    if (!$stream) {
                        return response('Cannot open file ' . $path, 500);
                    }
                    fseek($stream, $cStart);

                    $headers += [
                        "Content-Length" => $length,
                    ];

                    $headers["Content-Range"] = "bytes $cStart-$cEnd/$size";

                    $i = $cStart;
                    set_time_limit(0);
                    $buf = "";
                    $buffer = 102400;

                    while (!feof($stream) && $i <= $cEnd) {
                        $bytesToRead = $buffer;
                        if (($i + $bytesToRead) > $cEnd) {
                            $bytesToRead = $cEnd - $i + 1;
                        }
                        $buf .= fread($stream, $bytesToRead);
                        $i += $bytesToRead;
                    }

                    fclose($stream);

                    return response($buf, 206, $headers);

                } else {
//                    return response($request->has('get') ? \File::get($path) : null, 200, $headers + [
//                            'Content-Length' => $size
//                        ]);
//                    return response(\File::get($path), 200, [
//                        'Content-Type' => \File::mimeType($path),
//                        'Cache-Control' => 'max-age=2592000, public',
//                        'Expires' => gmdate('D, d M Y H:i:s', time() + 2592000) . ' GMT',
//                        'Last-Modified' => gmdate('D, d M Y H:i:s', \File::lastModified($path)) . ' GMT',
//                    ]);
                    /** @var ResponseFactory $response */
                    $response = response();

                    return $response->file($path);
                }
            } else {
                return response('Unknown file type for ' . $path);
            }
        } else {
            return response('File not found', 404);
        }
    }
}