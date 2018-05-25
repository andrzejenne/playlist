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
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\Medium;
use Vimeo\Laravel\VimeoManager;
use Vimeo\Vimeo;

/**
 * Class Youtube
 * @package BBIT\Playlist\Services\MediaProviders
 */
class VimeoService extends MediaProviderContract
{
    /**
     * @var Vimeo
     */
    private $service;


    /**
     * YouTubeService constructor.
     * @param VimeoManager $manager
     */
    public function __construct(Vimeo $manager)
    {
        $this->service = $manager;
    }


    /**
     * @param $q
     * @param int $perPage
     * @param null $pageToken
     * @return MediaItemCollection
     * @throws \Exception
     */
    public function search($q, $perPage = 16, $pageToken = null)
    {
        if (!$pageToken) {
            $pageToken = 1;
        }

        $args = ['query' => $q, 'page' => $pageToken, 'per_page' => $perPage];

        $search = $this->service->request('/videos', $args, 'GET');

        $details = $this->getDetails($search['results']);

        // @todo - create media list collection
        return $this->transformResults($details, $search['info']['prevPageToken'], $search['info']['nextPageToken']);
    }

    /**
     * @return string
     */
    public function getSlug()
    {
        return 'vimeo';
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
     * @param Medium $medium
     * @return string
     */
    public function getMediumDir(Medium $medium)
    {
        return $this->getOutDir($medium->provider_sid);
    }

    /**
     * @param Medium $medium
     * @param MediaFile $file
     * @return string
     */
    public function getMediumFilePath(Medium $medium, MediaFile $file)
    {
        return $this->getMediumDir($medium) . DIRECTORY_SEPARATOR . $file->filename;
    }

    /**
     * @param string $sid
     * @return string
     */
    public function getOutDir(string $sid)
    {
        return $this->getBasePath()
            . DIRECTORY_SEPARATOR . $sid[0] . $sid[1]
            . DIRECTORY_SEPARATOR . $sid[2] . $sid[3];
    }

    /**
     * @return string
     */
    public function getBasePath()
    {
        return storage_path('app'
            . DIRECTORY_SEPARATOR . 'media'
            . DIRECTORY_SEPARATOR . 'vimeo');
    }

    /**
     * @param $sid
     * @param bool $immediately
     * @return mixed
     * @throws \Exception
     * @deprecated
     */
    public function info($sid, $immediately = true)
    {
        throw new \Exception('not implemented ');

        $info = \Cache::get('info.vimeo.' . $sid);
        if (!$info && $immediately) {
            try {
                $info = $this->service->getVideoInfo($sid);
                if ($info) {
                    \Cache::forever('info.vimeo.' . $sid, $info);
                }
            } catch (\Exception $e) {
                $info = null;
            }
        }

        return $info;
    }


    /**
     * @param $results
     * @return \StdClass
     * @throws \Exception
     * @deprecated
     */
    private function getDetails($results)
    {
        $ids = [];
        $cached = [];
        $retrieved = [];
        foreach ($results as $result) {
//            if (isset($result->id->videoId)) {
            $sid = $result->id->videoId;
            $info = $this->info($sid, false);
            if ($info) {
                $cached[] = $info;
            } else {
                $ids[] = $sid;
            }
//            }
        }

        if (count($ids)) {
            $retrieved = $this->service->getVideoInfo($ids);
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
     * @deprecated
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
     * @deprecated
     */
    private function getDuration($duration)
    {
        $interval = new \DateInterval($duration);

        return $interval->h * 3600 + $interval->i * 60 + $interval->s;
    }


}