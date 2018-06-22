<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 11.3.18
 * Time: 21:00
 */

namespace BBIT\Playlist\Helpers;


use BBIT\Playlist\Contracts\MediaProviderContract;
use Illuminate\Contracts\Support\Arrayable;


/**
 * Class MediaListCollection
 * @package BBIT\Playlist\Helpers
 */
class MediaItemCollection implements Arrayable, \JsonSerializable
{
    private $items;

    /** @var MediaProviderContract */
    private $provider;

    /**
     * MediaListCollection constructor.
     * @param mixed[] $items
     * @param MediaProviderContract $provider
     */
    public function __construct($items, MediaProviderContract $provider)
    {
        $this->items = $items;
        $this->provider = $provider;
    }

    /**
     * @param MediaItem ...$item
     * @return MediaItemCollection
     */
    public function add(MediaItem ...$item)
    {
        $this->items = array_merge($this->items, $item);

        return $this;
    }

    /**
     * @return array
     */
    public function toArray()
    {
        return [
            'provider' => $this->provider->getSlug(),
            'items' => $this->items
            // @todo paginated collection
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