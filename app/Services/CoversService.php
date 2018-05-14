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
     * @return Cover
     */
    public function setCover(Album $album, $data, $type = 'front', $ext = 'jpg', $overwrite = false)
    {
        $cover = $album->covers()
            ->get()
            ->filter(function (Cover $cover) use ($type) {
                return $cover->type->slug == $type;
            })->first();

        if (!$cover) {
            /** @var Cover $cover */
            $cover = $album->covers()
                ->make();
            $cover->type()
                ->associate(
                    CoverType::whereSlug($type) // @todo - getter
                ->first()
                );

            $cover->save();
        }

        $hash = md5($album->id);

        $toDir = $this->path
            . DIRECTORY_SEPARATOR . $hash[0] . $hash[1]
            . DIRECTORY_SEPARATOR . $hash[2] . $hash[3];

        $to = $toDir . DIRECTORY_SEPARATOR . $album->id . '-' . $type . '.' . $ext;

        if (!\File::isDirectory($toDir) && !\File::exists($toDir)) {
            \File::makeDirectory($toDir, 0755, true, true);
        }

        if (!\File::exists($to) || $overwrite) {

            \File::put($to, $data);
        }

        return $cover;
    }
}