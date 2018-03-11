<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 11.3.18
 * Time: 12:59
 */

namespace BBIT\Playlist\Helpers;

/**
 * Class Str
 * @package BBIT\Playlist\Helpers
 */
class Str extends \Illuminate\Support\Str
{
    /**
     * @param $stub
     * @param $placeholder
     * @param $content
     * @return string
     */
    public static function replacePlaceholder($stub, $placeholder, $content)
    {
        return Str::replaceFirst("%$placeholder", $content, $stub);
    }
}