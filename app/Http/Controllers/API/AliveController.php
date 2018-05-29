<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 4.3.18
 * Time: 15:03
 */

namespace BBIT\Playlist\Http\Controllers\API;


/**
 * Class AliveController
 * @package BBIT\Playlist\Http\Controllers\API
 */
class AliveController extends Controller
{
    /**
     * @return bool
     */
    public function alive() {
        return response()->json(true);
    }

    /**
     * @return array
     */
    public function discover() {
        $host = parse_url(
            config('app.url')
        );

        if ($host['scheme'] === 'https') {
            $defPort = 443;
        }
        else {
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