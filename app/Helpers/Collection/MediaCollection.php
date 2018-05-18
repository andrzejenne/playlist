<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 16.5.18
 * Time: 8:23
 */

namespace BBIT\Playlist\Helpers\Collection;

use BBIT\Playlist\Models\Album;
use BBIT\Playlist\Models\Artist;
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\MediaProvider;
use BBIT\Playlist\Models\Medium;

/**
 * Class MediaCollection
 * @package BBIT\Playlist\Helpers\Collection
 */
class MediaCollection extends AbstractCollection
{
    /** @var string */
    private $provider;

    /**
     * MediaCollection constructor.
     * @param $args
     */
    public function __construct($args)
    {
        parent::__construct($args);

        $this->provider = isset($args->pSlug) ? $args->pSlug : null;
    }


    /**
     * @return $this
     * @throws \Exception
     */
    public function search()
    {
        if (!empty($this->search)) {
            $search = $this->search;
            $this->getBuilder()
                ->where(Medium::COL_NAME, 'like', "%$search%")
                ->orWhereHas(Medium::REL_ALBUM, function ($query) use ($search) {
                    $query->where(Album::COL_NAME, 'like', "%$search%");
                })->orWhereHas(Medium::REL_ARTIST, function ($query) use ($search) {
                    $query->where(Artist::COL_NAME, 'like', "%$search%");
                });
        }
        if (!empty($this->provider)) {
            $provider = MediaProvider::whereSlug($this->provider)->first();
            if ($provider) {
                $this->getBuilder()
                    ->where(Medium::COL_PROVIDER_ID, '=', $provider->id);
            }
        }

        // @todo - add search for album, artist, ...;
        // @todo - add search type

        return $this;
    }

    /**
     * @param $sid
     * @return Medium|null
     * @throws \Exception
     */
    public function find($sid)
    {
        return $this->getBuilder()
            ->whereProviderSid($sid)
            ->first();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder
     * @throws \Exception
     */
    protected function getBuilder()
    {
        if (!$this->builder) {
            $this->builder = Medium::with([
                Medium::REL_PROVIDER,
                Medium::REL_FILES . '.' . MediaFile::REL_TYPE,
                Medium::REL_ALBUM,
                Medium::REL_GENRE,
                Medium::REL_ARTIST
            ]);
        }

        return parent::getBuilder();
    }
}