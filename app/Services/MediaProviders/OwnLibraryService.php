<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 6.3.18
 * Time: 18:20
 */

namespace BBIT\Playlist\Services\MediaProviders;

use BBIT\Playlist\Contracts\MediaProviderContract;
use BBIT\Playlist\Helpers\Str;
use BBIT\Playlist\Models\LibraryAlbum;
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
     * @param string $q
     * @param int $perPage
     * @param string|null $pageToken
     * @return array
     */
    public function search(string $q, int $perPage = 16, string $pageToken = null)
    {
        return [];
    }

    /**
     * @return string
     */
    public function getSlug()
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
        $sid = $medium->provider_sid;
        $libHash = Str::substr($sid, 6, 6);
        $libPath = rtrim($this->getLib($libHash), DIRECTORY_SEPARATOR);

        /** @var LibraryAlbum $libraryAlbum */
        if ($medium->album && $medium->album->libraries) {
            foreach ($medium->album->libraries as $libraryAlbum) {
                if ($libraryAlbum->sid == $libHash) {
                    $possibleDir = $libPath . DIRECTORY_SEPARATOR . $libraryAlbum->path;
                    if (\File::exists($possibleDir)) {
                        return $possibleDir;
                    }
                }
            }
        }

        return null;
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
     * @param string $sid
     * @return mixed
     * @throws \Exception
     */
    public function getOutDir(string $sid)
    {
        throw new \Exception('Own Library cannot be used for downloading');
    }

    /**
     * @param string $sid
     * @throws \Exception
     */
    public function getMediumOriginUrl(string $sid)
    {
        throw new \Exception('Own Library has no origin');
    }

    /**
     * @throws \Exception
     */
    public function getBasePath()
    {
        throw new \Exception('Own Library has no base path');
    }

    /**
     * @param string $sid
     * @param bool $immediately
     * @return mixed
     * @throws \Exception
     */
    public function info(string $sid, $immediately = true)
    {
        throw new \Exception('not implemented');
    }


    /**
     * @param string $pathInLib
     * @param string $libPath
     * @return string
     */
    public static function genSid(string $pathInLib, string $libPath) //, $dirInLib)
    {
        return Str::substr(md5($pathInLib), 0, 6)
            . Str::substr(md5($libPath), 0, 6);
    }

    /**
     * @param string $md5
     * @return array|mixed|string
     */
    private function getLib(string $md5)
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

        return null;
    }

}