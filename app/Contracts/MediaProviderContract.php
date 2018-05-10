<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 6.3.18
 * Time: 18:19
 */

namespace BBIT\Playlist\Contracts;

/**
 * Interface MediaProviderContract
 * @package BBIT\Playlist\Contracts
 */
abstract class MediaProviderContract
{
    const KEY_DELETE = 'delete',
        KEY_SEARCH = 'search';

    abstract public function getName();

    abstract public function search($q, $perPage = 24, $pageToken = null);

    public final function getConfig()
    {
        return [
            self::KEY_SEARCH => false,
            self::KEY_DELETE => $this->canDelete()
        ];
    }

    abstract public function canDelete();

    abstract public function canSearch();

    /**
     * @return mixed
     */
    public final function __toString()
    {
        return $this->getName();
    }


}