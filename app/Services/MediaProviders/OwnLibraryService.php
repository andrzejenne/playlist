<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 6.3.18
 * Time: 18:20
 */

namespace BBIT\Playlist\Services\MediaProviders;

use BBIT\Playlist\Contracts\MediaProviderContract;
use BBIT\Playlist\Helpers\MediaItem;
use BBIT\Playlist\Helpers\MediaItemCollection;
use BBIT\Playlist\Helpers\MediaItemPaginatedCollection;
use BBIT\Playlist\Helpers\Str;
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\Medium;

/**
 * Class Youtube
 * @package BBIT\Playlist\Services\MediaProviders
 */
class OwnLibraryService extends MediaProviderContract
{
    /** @var string[] */
    private $libs;

    /**
     * @param $q
     * @param int $perPage
     * @param null $pageToken
     * @return array
     */
    public function search($q, $perPage = 16, $pageToken = null)
    {
        return [];
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'library';
    }

    /**
     * @return bool
     */
    public function canDelete()
    {
        return false;
    }

    /**
     * @return bool
     */
    public function canSearch()
    {
        return false;
    }

    /**
     * @param Medium $medium
     * @return mixed
     */
    public function getMediumDir(Medium $medium)
    {
        return $this->getOutDir($medium->provider_sid);
    }

    /**
     * @param Medium $medium
     * @param MediaFile $file
     * @return string
     */
    public function getMediumFilePath(Medium $medium, MediaFile $file)
    {
        return $this->getMediumDir($medium) . DIRECTORY_SEPARATOR . $file->filename;
    }

    /**
     * @param $sid
     * @return mixed
     */
    public function getOutDir($sid)
    {
        return rtrim($this->getLib(Str::substr($sid, 6, 6)), DIRECTORY_SEPARATOR)
            . DIRECTORY_SEPARATOR
            . ltrim(Str::substr($sid, 12), DIRECTORY_SEPARATOR);
    }

    /**
     * @param $pathInLib
     * @param $libPath
     * @param $dirInLib
     * @return string
     */
    public static function genSid($pathInLib, $libPath, $dirInLib)
    {
        return Str::substr(md5($pathInLib), 0, 6)
            . Str::substr(md5($libPath), 0, 6)
            . $dirInLib;
    }

    /**
     * @param $md5
     * @return array|mixed|string
     */
    private function getLib($md5)
    {
        if (!$this->libs) {
            $this->libs = [];
            $path = config('media.library.path');
            if (!$path) {
                return [];
            } else {
                $path = explode(':', $path);

                foreach ($path as $dir) {
                    $this->libs[Str::substr(md5($dir), 0, 6)] = $dir;
                }
            }
        }

        if (isset($this->libs[$md5])) {
            return $this->libs[$md5];
        }

        print_r($this->libs);

        return null;
    }

}