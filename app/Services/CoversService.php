<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 14.5.18
 * Time: 16:18
 */

namespace BBIT\Playlist\Services;

use BBIT\Playlist\Models\Album;
use BBIT\Playlist\Models\Cover;
use BBIT\Playlist\Models\CoverType;

/**
 * Class CoversService
 * @package BBIT\Playlist\Services
 */
class CoversService
{
    /** @var string */
    private $path;

    /**
     * CoversService constructor.
     */
    public function __construct()
    {
        $this->path = config('media.covers.path');
    }

    /**
     * @param Album $album
     * @param $data
     * @param string $type
     * @param string $ext
     * @param bool $overwrite
     * @return Cover
     * @throws \Exception
     */
    public function setCover(Album $album, $data, $type = 'front', $ext = 'jpg', $overwrite = false)
    {
        $cover = $album->covers()
            ->get()
            ->filter(function (Cover $cover) use ($type) {
                return $cover->type->slug == $type;
            })->first();

        $coverType = CoverType::whereSlug($type)
            ->first();// @todo - getter

        if (!$coverType) {
            throw new \Exception('Cover type ' . $type . ' not found');
        }

        if (!$cover) {
            /** @var Cover $cover */
            $cover = $album->covers()
                ->make();
            $cover->type()
                ->associate(
                    $coverType
                );

            $cover->save();
        }

        $to = ($toDir = $this->getToDir($album))
            . DIRECTORY_SEPARATOR . $this->getCoverFileName($album, $coverType, $ext);

        if (!\File::isDirectory($toDir) && !\File::exists($toDir)) {
            \File::makeDirectory($toDir, 0755, true, true);
        }

        if (!\File::exists($to) || $overwrite) {

            \File::put($to, $data);
        }

        return $cover;
    }

    /**
     * @param Album $album
     * @param CoverType $type
     * @return mixed
     */
    public function getCoverPath(Album $album, CoverType $type) {
        $coversDir = $this->getToDir($album);

        $file = $this->getCoverFileName($album, $type, '*');

        $files = glob($coversDir . DIRECTORY_SEPARATOR . $file);

        return reset($files);
    }

    /**
     * @param Album $album
     * @param CoverType $type
     * @param $ext
     * @return string
     */
    private function getCoverFileName(Album $album, CoverType $type, $ext)
    {
        return $album->id . '-' . $type->slug . '.' . $ext;
    }

    /**
     * @param Album $album
     * @return string
     */
    public function getToDir(Album $album) {
        $hash = md5($album->id);

        return $this->path
            . DIRECTORY_SEPARATOR . $hash[0] . $hash[1]
            . DIRECTORY_SEPARATOR . $hash[2] . $hash[3];
    }
}