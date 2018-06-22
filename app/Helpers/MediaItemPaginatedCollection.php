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
class MediaItemPaginatedCollection extends MediaItemCollection
{
    private $next;
    private $prev;

    /**
     * MediaListCollection constructor.
     * @param mixed $next
     * @param mixed $prev
     * @param mixed[] $items
     * @param MediaProviderContract $provider
     */
    public function __construct($prev, $next, $items, MediaProviderContract $provider)
    {
        parent::__construct($items, $provider);

        $this->next = $next;
        $this->prev = $prev;
    }

    /**
     * @return array
     */
    public function toArray()
    {
        return parent::toArray() + [
            'next' => $this->next,
            'prev' => $this->prev
        ];
    }
}