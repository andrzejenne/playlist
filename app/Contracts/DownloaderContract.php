<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 14:39
 */

namespace BBIT\Playlist\Contracts;

use Illuminate\Support\Collection;

/**
 * Class DownloaderContract
 * @package BBIT\Playlist\Contracts
 */
abstract class DownloaderContract
{
    /**
     * @param $sid
     * @return string
     * @throws \Exception
     */
    abstract public function download($sid);

    /**
     * @param $sid
     * @param string $format
     * @return string
     * @throws \Exception
     */
    abstract public function downloadAudio($sid, $format = 'mp3');

    /**
     * @param $sid
     * @return Collection
     */
    abstract public function getVideos($sid);

    /**
     * @param $sid
     * @return Collection
     */
    abstract public function getAudios($sid);

    /**
     * @param $sid
     * @return string
     */
    abstract public function getName($sid);
}