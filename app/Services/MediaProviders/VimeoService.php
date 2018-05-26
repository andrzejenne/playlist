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
use function GuzzleHttp\Psr7\parse_query;
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
    private $vimeo;


    /**
     * YouTubeService constructor.
     */
    public function __construct()
    {
        $this->vimeo = new Vimeo(config('vimeo.client_id'), config('vimeo.client_secret'));
        $this->vimeo->setToken(config('vimeo.access_token'));
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
        } else {
            $query = parse_query($pageToken);
            $pageToken = $query['page'];
        }

        $args = ['query' => $q, 'page' => $pageToken, 'per_page' => $perPage];

        $search = $this->vimeo->request('/videos', $args, 'GET');

        return $this->transformResults($search['body']['data'], $search['body']['paging']['previous'], $search['body']['paging']['next']);
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

    public function getMediumOriginUrl($sid)
    {
        return 'https://vimeo.com/' . $sid;
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
            $matches = [];
            preg_match('/(\d+)/', $result['uri'], $matches);
            if (isset($matches[1])) {
                $id = $matches[1];

                $collection->add(
                    MediaItem::create(
                        $id,
                        $result['name'],
                        !empty($result['description']) ? $result['description'] : '',
                        static::getClosestToWidth($result['pictures']['sizes'], $result['width']),
                        $result['link'],
                        $result['duration']
                    )
                );
            }
        }

        return $collection;
    }

    /**
     * @param $links
     * @param $width
     * @return null
     */
    private static function getClosestToWidth($links, $width)
    {
        $closest = null;
        foreach ($links as $link) {
            if ($closest === null) {
                $closest = $link;
            } else if (abs($link['width'] - $width) < abs($closest['width'] - $width)) {
                $closest = $link;
            }
        }

        return $closest['link'];
    }


}