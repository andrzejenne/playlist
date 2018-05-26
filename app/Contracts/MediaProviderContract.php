<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 6.3.18
 * Time: 18:19
 */

namespace BBIT\Playlist\Contracts;

use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\Medium;

/**
 * Interface MediaProviderContract
 * @package BBIT\Playlist\Contracts
 */
abstract class MediaProviderContract
{
    const
        KEY_SLUG = 'slug',
        KEY_DELETE = 'delete',
        KEY_SEARCH = 'search';

    abstract public function getSlug();

    abstract public function search($q, $perPage = 24, $pageToken = null);

    public final function getConfig()
    {
        return [
            self::KEY_SLUG => $this->getSlug(),
            self::KEY_SEARCH => $this->canSearch(),
            self::KEY_DELETE => $this->canDelete()
        ];
    }

    abstract public function canDelete();

    abstract public function canSearch();

    abstract public function getMediumDir(Medium $medium);

    abstract public function getMediumFilePath(Medium $medium, MediaFile $file);

    abstract public function getOutDir(string $sid);

    abstract public function getMediumOriginUrl($sid);

    /**
     * @return mixed
     */
    public final function __toString()
    {
        return $this->getSlug();
    }


}