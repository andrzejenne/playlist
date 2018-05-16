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
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Models\Playlist;

/**
 * Class PlaylistCollection
 * @package BBIT\Playlist\Helpers\Collection
 */
class PlaylistCollection extends AbstractCollection
{

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

        // @todo - add search for album, artist, ...;
        // @todo - add search type

        return $this;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder
     * @throws \Exception
     */
    protected function getBuilder()
    {
        if (!$this->builder) {
            $this->builder = Playlist::with([
                Playlist::REL_MEDIA . '.' . Medium::REL_PROVIDER,
                Playlist::REL_MEDIA . '.' . Medium::REL_FILES . '.' . MediaFile::REL_TYPE,
                Playlist::REL_MEDIA . '.' . Medium::REL_ALBUM,
                Playlist::REL_MEDIA . '.' . Medium::REL_GENRE,
                Playlist::REL_MEDIA . '.' . Medium::REL_ARTIST
            ]);
        }

        return parent::getBuilder();
    }
}