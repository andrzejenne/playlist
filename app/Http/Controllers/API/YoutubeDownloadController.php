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
        $info = InfoController::getInfo($sid);
        if ($info) {
            $collection = collect($info['formats']);

            $videos = $collection->filter(function ($item) {
                if (in_array($item['ext'], static::$possibleVideos)) {
                    return $item;
                }

                return false;
            })->sortByDesc(function ($item) {
                return $item['width'];
            });

            $audios = $collection->filter(function ($item) {
                if (in_array($item['ext'], static::$possibleAudios)) {
                    return $item;
                }

                return false;
            })->sortByDesc(function ($item) {
                return $item['abr'];
            }, SORT_NUMERIC);

            if ($videos->count() && $audios->count()) {
                $vcode = $videos->first()['format_id'];
                $acode = $audios->first()['format_id'];
                $cmd = Process::prepare('youtube-dl')
                    ->enableErrorOutput()
                    ->enableOutput()
                    ->setWorkingDir(storage_path('temp'))
                    ->execute('-f', "$vcode+$acode", $sid);

                return response()->json(['message' => 'downloaded', 'report' => $cmd->report()]);
            }
            else {
                return response()->json(['message' => 'cannot download']);
            }
        }
    }
}