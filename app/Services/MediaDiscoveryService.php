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

    /**
     * MediaDiscoveryService constructor.
     * @param MediaLibraryProvider $libraryProvider
     */
    public function __construct(MediaLibraryProvider $libraryProvider)
    {
        $this->libraryProvider = $libraryProvider;
    }

    /**
     * @param $sid
     * @param $fid
     * @return string|null
     */
    public function getFilePath($sid, $fid)
    {
        try {
            $medium = Medium::whereProviderSid($sid)->first();
            if ($medium instanceof Medium) {
                /** @var MediaFile $file */
                $file = $medium->files()->whereId($fid)->first();
                if ($file instanceof MediaFile) {
                    $path = $this->getMediumDir($medium->provider->slug,
                            $medium->provider_sid) . DIRECTORY_SEPARATOR . $file->filename;
                    if (\File::exists($path)) {
                        return $path;
                    }
                }
            }
        } catch (\Throwable $t) {
            // @todo - log file not found
        }

        return null;
    }

    /**
     * @param DownloadProcess $proc
     */
    public function disoverMedia(DownloadProcess $proc)
    {
        $id = $proc->getRequest()->getSid();
        $downloader = $proc->getDownloader();
        $dir = $this->getMediumDir($downloader->getProvider(), $id);

        $provider = $downloader->getProvider();

        $mediaProvider = $this->getMediaProvider($provider->getName());

        /** @var Medium $medium */
        $medium = Medium::whereProviderId($mediaProvider->id)
            ->whereProviderSid($id)
            ->first();

        if (!$medium) {
            $medium = new Medium([
                Medium::COL_NAME => $downloader->getName($id),
                Medium::COL_PROVIDER_SID => $id
            ]);
            $medium->provider()
                ->associate($provider);

            $medium->save();
            $existing = [];
        } else {
            $existing = $medium->files->map(function (MediaFile $file) {
                return $file->filename;
            });
        }

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
                        $typeSlug = 'audio';
                        break;
                    case 'mp4':
                    case 'mkv':
                    default:
                        $typeSlug = 'video';
                        break;
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