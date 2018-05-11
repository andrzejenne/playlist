<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 12.4.18
 * Time: 9:34
 */

namespace BBIT\Playlist\Services\Downloader;

use BBIT\Playlist\Contracts\DownloaderContract;
use BBIT\Playlist\Contracts\MediaProviderContract;


/**
 * Class DownloadRequest
 * @package BBIT\Playlist\Services\Downloader
 */
class DownloadRequest
{
    /** @var MediaProviderContract  */
    private $provider;
    private $sid;
    private $type;
    private $format;

    /**
     * DownloadRequest constructor.
     * @param MediaProviderContract $provider
     * @param $sid
     * @param $type
     * @param $format
     */
    public function __construct(
        MediaProviderContract $provider,
        $sid,
        $type,
        $format
    ) {
        $this->provider = $provider;
        $this->sid = $sid;
        $this->type = $type;
        $this->format = $format;
    }

    /**
     * @param MediaProviderContract $provider
     * @param $sid
     * @param $type
     * @param $format
     * @return static
     */
    public static function create(
        MediaProviderContract $provider,
        $sid,
        $type,
        $format
    ) {
        return new static($provider, $sid, $type, $format);
    }

    /**
     * @return MediaProviderContract
     */
    public function getProvider()
    {
        return $this->provider;
    }

    /**
     * @return mixed
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return mixed
     */
    public function getSid()
    {
        return $this->sid;
    }

    /**
     * @return mixed
     */
    public function getFormat()
    {
        return $this->format;
    }

    /**
     * @param DownloaderContract $downloader
     * @return DownloadProcess
     * @throws \Exception
     */
    public function makeDownload(DownloaderContract $downloader) {
        return DownloadProcess::download($downloader, $this);
    }

}