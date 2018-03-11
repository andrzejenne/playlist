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
    public function getName();
    public function search($q);
}