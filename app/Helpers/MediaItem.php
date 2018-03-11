<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 11.3.18
 * Time: 21:01
 */

namespace BBIT\Playlist\Helpers;


use Illuminate\Contracts\Support\Arrayable;

/**
 * Class MediaItem
 * @package BBIT\Playlist\Helpers
 */
class MediaItem implements Arrayable, \JsonSerializable
{
    private $sid;

    private $title;

    private $description;

    private $thumbnail;

    private $duration;

    /**
     * MediaItem constructor.
     * @param string $sid
     * @param string $title
     * @param string $description
     * @param string $thumbnail
     * @param string $duration
     */
    public function __construct(string $sid, string $title, string $description, string $thumbnail, string $duration)
    {
        $this->sid = $sid;
        $this->title = $title;
        $this->description = $description;
        $this->thumbnail = $thumbnail;
        $this->duration = $duration;
    }

    /**
     * @param string $sid
     * @param string $title
     * @param string $description
     * @param string $thumbnail
     * @param string $duration
     * @return MediaItem
     */
    public static function create(string $sid, string $title, string $description, string $thumbnail, string $duration)
    {
        return new static($sid, $title, $description, $thumbnail, $duration);
    }

    /**
     * @return string
     */
    public function getSid()
    {
        return $this->sid;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @return string
     */
    public function getThumbnail()
    {
        return $this->thumbnail;
    }


    /**
     * @return array
     */
    public function toArray()
    {
        return [
            'sid' => $this->sid,
            'title' => $this->title,
            'description' => $this->description,
            'thumbnail' => $this->thumbnail,
            'duration' => $this->duration
        ];
    }

    /**
     * @return array|mixed
     */
    public function jsonSerialize()
    {
        return $this->toArray();
    }


}