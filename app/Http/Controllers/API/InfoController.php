<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 18.3.18
 * Time: 17:08
 */

namespace BBIT\Playlist\Http\Controllers\API;

use BBIT\Playlist\Helpers\Process;


/**
 * Class InfoController
 * @package BBIT\Playlist\Http\Controllers
 * @deprecated
 */
class InfoController
{
    /**
     * @param $sid
     * @return \Illuminate\Http\JsonResponse
     * @throws \Exception
     */
    public function info($sid)
    {
        return response()->json(['message' => static::getInfo($sid)]);
    }

    /**
     * @param $sid
     * @return mixed
     * @throws \Exception
     */
    public static function getInfo($sid)
    {
        try {
            $cmd = Process::prepare('youtube-dl')
                ->enableOutput()
                ->enableErrorOutput()
                ->setWorkingDir(storage_path('temp'))
                ->execute('-J', $sid);

            return json_decode($cmd->info(), true);
        }
        catch (\Exception $e) {
            return false;
        }
    }
}