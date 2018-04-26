<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 21.4.18
 * Time: 21:23
 */

namespace BBIT\Playlist\Services;

use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\MediaFileType;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Services\Downloader\DownloadProcess;


/**
 * Class MediaDiscoveryService
 * @package BBIT\Playlist\Services
 */
class MediaDiscoveryService
{
    /**
     * @param $provider
     * @param $id
     * @return string
     */
    public function getOutDir($provider, $id) {
        return storage_path('app/media/'.$provider.'/' . $id[0] . $id[1] . '/' . $id[2] . $id[3]);
    }

    /**
     * @param $sid
     * @param $fid
     * @return string|null
     */
    public function getFilePath($sid, $fid) {
        try {
            $medium = Medium::whereProviderSid($sid)->first();
            if ($medium instanceof Medium) {
                /** @var MediaFile $file */
                $file = $medium->files()->whereId($fid)->first();
                if ($file instanceof MediaFile) {
                    $path = $this->getOutDir($medium->provider->slug, $medium->provider_sid) . DIRECTORY_SEPARATOR . $file->filename;
                    if (\File::exists($path)) {
                        return $path;
                    }
                }
            }
        }
        catch (\Throwable $t) {
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
        $dir = $this->getOutDir($downloader->getProviderSlug(), $id);

        $provider = $downloader->getProvider();

        /** @var Medium $medium */
        $medium = Medium::whereProviderId($provider->getId())
            ->whereProviderSid($id)
            ->first();

        if (!$medium) {
            $medium = new Medium([
                Medium::COL_NAME => $downloader->getName($id),
                Medium::COL_PROVIDER_SID => $id
            ]);
            $medium->provider()->associate($provider);
            $medium->save();
            $existing = [];
        }
        else {
            $existing = $medium->files->map(function(MediaFile $file){
                return $file->filename;
            });
        }

        $files = \File::allFiles($dir);
//        $unknown = MediaType::whereSlug('unknown')->first();
        $types = MediaFileType::all()->mapWithKeys(function(MediaFileType $type){
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
                switch($ext) {
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
                $fileRecord->media()->associate($medium);
                $fileRecord->type()->associate($types[$typeSlug]);
                $fileRecord->save();
            }
        }
    }
}