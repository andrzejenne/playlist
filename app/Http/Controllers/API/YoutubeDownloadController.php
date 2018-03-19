<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 18.3.18
 * Time: 17:24
 */

namespace BBIT\Playlist\Http\Controllers\API;


use BBIT\Playlist\Helpers\Process;
use Illuminate\Support\Collection;

class YoutubeDownloadController
{
    public static $possibleAudios = [
        'm4a'
    ];

    public static $possibleVideos = [
        'mp4'
    ];

    /**
     * @param $sid
     * @throws \Exception
     */
    public function download($sid)
    {
        try {
            $response = $this->call('service:download', ['sid' => $sid]);

            return response()->json(['message' => 'downloaded', 'report' => $response]);
        }
        catch (\Throwable $t) {
            return response()->json(['error' => true, 'message' => $t->getMessage()]);
        }
    }
}