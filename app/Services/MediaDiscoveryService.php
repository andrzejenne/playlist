<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 21.4.18
 * Time: 21:23
 */

namespace BBIT\Playlist\Services;

use BBIT\Playlist\Contracts\MediaProviderContract;
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\MediaFileType;
use BBIT\Playlist\Models\MediaProvider;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Providers\MediaLibraryProvider;
use BBIT\Playlist\Services\Downloader\DownloadProcess;


/**
 * Class MediaDiscoveryService
 * @package BBIT\Playlist\Services
 */
class MediaDiscoveryService
{
    /**
     * @var MediaLibraryProvider
     */
    private $libraryProvider;

    /**
     * @var MediaProvider[]
     */
    private $mediaProviderEntities;

    /** @var \getID3 */
    private $id3;

    /**
     * MediaDiscoveryService constructor.
     * @param MediaLibraryProvider $libraryProvider
     */
    public function __construct(MediaLibraryProvider $libraryProvider)
    {
        $this->libraryProvider = $libraryProvider;

        try {
            $this->id3 = new \getID3();
        } catch (\Exception $e) {
            // @todo - log error
        }
    }

    /**
     * @param $id
     * @param $fid
     * @return string|null
     */
    public function getFilePath($id, $fid)
    {
        $medium = Medium::whereId($id)->first();
        if ($medium instanceof Medium) {
            /** @var MediaProviderContract $providerLibrary */
            $providerLibrary = $medium->provider->getService();

            /** @var MediaFile $file */
            $file = $medium->files()
                ->whereId($fid)
                ->first();

            if ($file instanceof MediaFile) {
                /*                    $path = $this->getMediumDir($medium->provider->slug,
                                            $medium->provider_sid) . DIRECTORY_SEPARATOR . $file->filename;*/

                $path = $providerLibrary->getMediumFilePath($medium, $file);

                if (\File::exists($path)) {
                    return $path;
                }
            }
        }

        return null;
    }

    /**
     * @param DownloadProcess $proc
     */
    public function disoverDownloadedMedia(DownloadProcess $proc)
    {
        $id = $proc->getRequest()->getSid();

        $downloader = $proc->getDownloader();

        $provider = $downloader->getProvider();

        $mediaProvider = $this->getMediaProvider($provider->getName());

        $this->discoverMedia($id, $downloader->getName($id), $provider, $mediaProvider);
    }

    /**
     * @param $id
     * @param $name
     * @param MediaProviderContract $provider
     * @param MediaProvider $mediaProvider
     */
    public function discoverMedia($id, $name, MediaProviderContract $provider, MediaProvider $mediaProvider)
    {

        /** @var Medium $medium */
        $medium = Medium::whereProviderId($mediaProvider->id)
            ->whereProviderSid($id)
            ->first();

        $duration = null;

        if (!$medium) {
            $medium = new Medium([
                Medium::COL_NAME => $name,
//                Medium::COL_DURATION => $duration,
                Medium::COL_PROVIDER_SID => $id
            ]);
            $medium->provider()
                ->associate($mediaProvider);

            $medium->save();
            $existing = [];
        } else {
            $existing = $medium->files()->get()->mapWithKeys(function (MediaFile $file) {
                return [$file->filename => $file];
            })->toArray();
        }

        $dir = $provider->getMediumDir($medium);

        $files = \File::allFiles($dir);
//        $unknown = MediaType::whereSlug('unknown')->first();
        $types = MediaFileType::all()
            ->mapWithKeys(
                function (MediaFileType $type) {
                    return [$type->slug => $type];
                });

        foreach ($files as $file) {
            $filename = basename($file);
            if (!isset($existing[$filename])) {
                $fileRecord = new MediaFile([
                    MediaFile::COL_FILENAME => $filename,
                    MediaFile::COL_SIZE => filesize($file)
                ]);

                $typeSlug = null;
                $ext = $file->getExtension();

                switch ($ext) {
                    case 'jpg':
                    case 'png':
                        $typeSlug = 'thumbnail';
                        break;
                    case 'mp3':
                    case 'ogg':
                    case 'acc':
                        $typeSlug = 'audio';
                        if ($this->id3) {
                            $analyze = $this->id3->analyze($file);
                        }

                        break;
                    case 'mp4':
                    case 'mkv':
                    default:
                        $typeSlug = 'video';

                        if ($this->id3) {
                            $analyze = $this->id3->analyze($file);
                        }

                        break;
                }

                if (isset($analyze)) {
                    if (isset($analyze['playtime_seconds'])) {
                        $medium->setAttribute($medium::COL_DURATION, $analyze['playtime_seconds']);
                        $medium->save();
                    }
                }

                $fileRecord->media()
                    ->associate($medium);

                $fileRecord->type()
                    ->associate($types[$typeSlug]);

                $fileRecord->save();
            }
        }
    }

    /**
     * @param $slug
     * @return MediaProvider
     *
     * @todo - MediaProvider Repository
     */
    private function getMediaProvider($slug)
    {
        if (!isset($this->mediaProviderEntities[$slug])) {
            $this->mediaProviderEntities[$slug] = MediaProvider::whereSlug($slug)->first();
        }

        return $this->mediaProviderEntities[$slug];
    }

    /**
     * @param MediaProviderContract $provider
     * @param Medium $medium
     * @return string
     */
    public static function getMediumDir(MediaProviderContract $provider, Medium $medium)
    {
        return static::getProviderPath($provider, $provider->getMediumDir($medium));
    }

    /**
     * @param MediaProviderContract $provider
     * @param Medium $medium
     * @param MediaFile $file
     * @return string
     */
    public static function getMediumFilePath(MediaProviderContract $provider, Medium $medium, MediaFile $file)
    {
        return static::getProviderPath($provider, $provider->getMediumFilePath($medium, $file));
    }

    /**
     * @param MediaProviderContract $provider
     * @param null $append
     * @return string
     */
    private static function getProviderPath(MediaProviderContract $provider, $append = null)
    {
        return storage_path('app' . DIRECTORY_SEPARATOR . 'media' . DIRECTORY_SEPARATOR . $provider
            . ($append ? DIRECTORY_SEPARATOR . $append : '')
        );
    }

}