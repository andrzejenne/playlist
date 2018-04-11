<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 11.4.18
 * Time: 10:54
 */

namespace BBIT\Playlist\Models\Traits;


/**
 * Trait UsesSlug
 * @package BBIT\Playlist\Models\Traits
 */
trait HasSlug
{
    /**
     * @param $slug
     * @return mixed
     */
    public static function getBySlug($slug) {
        return static::where(self::COL_SLUG, '=', $slug)->first();
    }
}