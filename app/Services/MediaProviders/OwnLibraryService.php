<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 6.3.18
 * Time: 18:20
 */

namespace BBIT\Playlist\Services\MediaProviders;

use BBIT\Playlist\Contracts\MediaProviderContract;
use BBIT\Playlist\Helpers\MediaItem;
use BBIT\Playlist\Helpers\MediaItemCollection;
use BBIT\Playlist\Helpers\MediaItemPaginatedCollection;

/**
 * Class Youtube
 * @package BBIT\Playlist\Services\MediaProviders
 */
class OwnLibraryService extends MediaProviderContract
{

    /**
     * @param $q
     * @param int $perPage
     * @param null $pageToken
     * @return array
     */
    public function search($q, $perPage = 16, $pageToken = null)
    {
        return [];
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'library';
    }

    /**
     * @return bool
     */
    public function canDelete()
    {
        return false;
    }

    /**
     * @return bool
     */
    public function canSearch()
    {
        return false;
    }


}