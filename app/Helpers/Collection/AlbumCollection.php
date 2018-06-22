<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 16.5.18
 * Time: 8:23
 */

namespace BBIT\Playlist\Helpers\Collection;

use BBIT\Playlist\Models\Album;
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\Medium;

/**
 * Class AlbumCollection
 * @package BBIT\Playlist\Helpers\Collection
 */
class AlbumCollection extends AbstractCollection
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
     * @return \Illuminate\Database\Eloquent\Builder|\Illuminate\Database\Query\Builder
     * @throws \Exception
     */
    protected function getBuilder()
    {
        if (!$this->builder) {
            $this->builder = Album::with([
//                Album::REL_MEDIA . '.' . Medium::REL_FILES . '.' . MediaFile::REL_TYPE,
                Album::REL_GENRE,
                Album::REL_ARTIST
            ])
                ->getQuery()
                ->orderBy(Album::COL_NAME, 'ASC');
        }

        return parent::getBuilder();
    }
}