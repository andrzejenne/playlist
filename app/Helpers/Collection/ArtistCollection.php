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
use BBIT\Playlist\Models\Medium;

/**
 * Class ArtistCollection
 * @package BBIT\Playlist\Helpers\Collection
 */
class ArtistCollection extends AbstractCollection
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
                ->where(Medium::COL_NAME, 'like', "%$search%");
        }

        return $this;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder
     * @throws \Exception
     */
    protected function getBuilder()
    {
        if (!$this->builder) {
            $this->builder = Artist::with([
//                Artist::REL_MEDIA . '.' . Medium::REL_FILES . '.' . MediaFile::REL_TYPE,
                Artist::REL_ALBUMS
            ])->orderBy(Album::COL_NAME, 'ASC');
        }

        return parent::getBuilder();
    }
}