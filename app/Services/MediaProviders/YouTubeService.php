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
class YouTubeService extends MediaProviderContract
{

    /**
     * @param $q
     * @param int $perPage
     * @param null $pageToken
     * @return MediaItemCollection
     * @throws \Exception
     */
    public function search($q, $perPage = 16, $pageToken = null)
    {
        $args = ['q' => $q, 'part' => 'id', 'maxResults' => $perPage, 'type' => 'video'];
        if ($pageToken) {
            $args['pageToken'] = $pageToken;
        }

        $search = \Youtube::searchAdvanced($args, true);

        $details = $this->getDetails($search['results']);

        // @todo - create media list collection
        return $this->transformResults($details, $search['info']['prevPageToken'], $search['info']['nextPageToken']);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'youtube';
    }

    /**
     * @return bool
     */
    public function canDelete()
    {
        return true;
    }

    /**
     *
     */
    public function canSearch()
    {
        return true;
    }


    /**
     * @param $results
     * @return \StdClass
     * @throws \Exception
     */
    private function getDetails($results)
    {
        $ids = [];
        $cached = [];
        $retrieved = [];
        foreach ($results as $result) {
//            if (isset($result->id->videoId)) {
                $sid = $result->id->videoId;
                $info = \Cache::get('info.youtube.' . $sid);
                if ($info) {
                    $cached[] = $info;
                } else {
                    $ids[] = $sid;
                }
//            }
        }

        if (count($ids)) {
            $retrieved = \Youtube::getVideoInfo($ids);
            foreach ($retrieved as $item) {
                \Cache::forever('info.youtube.' . $item->id, $item);
            }
        }

        return array_merge($cached, $retrieved);
    }

    /**
     * @param $results
     * @param $prevPageToken
     * @param $nextPageToken
     * @return MediaItemCollection
     * @throws \Exception
     */
    private function transformResults($results, $prevPageToken, $nextPageToken)
    {
        $collection = new MediaItemPaginatedCollection($prevPageToken, $nextPageToken, [], $this);

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
                            $result->snippet->thumbnails->medium->url, // @todo configurable size
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