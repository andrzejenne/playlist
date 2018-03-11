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

/**
 * Class Youtube
 * @package BBIT\Playlist\Services\MediaProviders
 */
class YouTubeService implements MediaProviderContract
{

    /**
     * @param $q
     * @return MediaItemCollection
     * @throws \Exception
     */
    public function search($q)
    {
        $results = \Youtube::search($q, 20, ['id']);

        $results = $this->getDetails($results);

        // @todo - create media list collection
        return $this->transformResults($results);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'youtube';
    }

    /**
     * @param $results
     * @return \StdClass
     * @throws \Exception
     */
    private function getDetails($results)
    {
        $ids = [];
        foreach ($results as $result) {
            if (isset($result->id->videoId)) {
                $ids[] = $result->id->videoId;
            }
        }

        return \Youtube::getVideoInfo($ids);
    }

    /**
     * @param $results
     * @return MediaItemCollection
     * @throws \Exception
     */
    private function transformResults($results)
    {
        $collection = new MediaItemCollection([], $this);

        foreach ($results as $result) {
            if (isset($result->id)) {
                $duration = null;
                try {
                    $duration = $this->getDuration($result->contentDetails->duration);
                } finally {
                    $collection->add(
                        MediaItem::create(
                            $result->id,
                            $result->snippet->title,
                            $result->snippet->description,
                            $result->snippet->thumbnails->default->url,
                            $duration
                        )
                    );
                }
            }
        }

        return $collection;
    }

    /**
     * @param $duration
     * @return float|int
     * @throws \Exception
     */
    private function getDuration($duration)
    {
        $interval = new \DateInterval($duration);

        return $interval->h * 3600 + $interval->i * 60 + $interval->s;
    }


}