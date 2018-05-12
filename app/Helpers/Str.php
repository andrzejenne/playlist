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

    public static function toBytes($size)
    {
        switch (substr($size, -1)) {
            case 'M':
            case 'm':
                return (int)$size * 1048576;
            case 'K':
            case 'k':
                return (int)$size * 1024;
            case 'G':
            case 'g':
                return (int)$size * 1073741824;
            default:
                return $size;
        }
    }
}