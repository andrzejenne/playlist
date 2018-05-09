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
interface MediaProviderContract
{
    const KEY_DELETE = 'delete',
        KEY_SEARCH = 'search';

    public function getName();
    public function search($q, $perPage = 24, $pageToken = null);
    public function getConfig();
}