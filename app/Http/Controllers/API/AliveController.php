<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:03
 */

namespace BBIT\Playlist\Http\Controllers\API;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;


/**
 * Class AliveController
 * @package BBIT\Playlist\Http\Controllers\API
 */
class AliveController extends Controller
{
    /**
     * @return JsonResponse
     */
    public function alive()
    {
        return response()->json([
            'status' => true
        ]);
    }

    /**
     * @return JsonResponse
     */
    public function discover()
    {
        $host = parse_url(
            config('app.url')
        );

        if ($host['scheme'] === 'https') {
            $defPort = 443;
        } else {
            $defPort = 80;
        }

        return response()->json([
            'host' => $host['host'],
            'port' => isset($host['port']) ? $host['port'] : $defPort,
            'scheme' => $host['scheme'],
            'wampPort' => config('ratchet.port'),
            'wampScheme' => config('ratchet.scheme')
        ]);
    }
}