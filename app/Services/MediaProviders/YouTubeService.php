<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 6.3.18
 * Time: 18:20
 */

namespace BBIT\Playlist\Services\MediaProviders;

use BBIT\Playlist\Contracts\MediaProviderContract;

/**
 * Class Youtube
 * @package BBIT\Playlist\Services\MediaProviders
 */
class YouTubeService implements MediaProviderContract
{

    /**
     * @param $q
     * @return array
     */
    public function search($q)
    {
        $results = \Youtube::search($q);

        // @todo - create media list collection
        return $this->transformResults($results);
    }

    private function transformResults($results) {
        $data = [];
        foreach ($results as $result) {
            $data[] = [
                'title' => $result->snippet->title,
                'description' => $result->snippet->description,
                'thumbnail' => $result->snippet->thumbnails->default->url
            ];
        }

        return $data;
    }



}