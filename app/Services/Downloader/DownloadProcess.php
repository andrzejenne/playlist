<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 12.4.18
 * Time: 9:34
 */

namespace BBIT\Playlist\Services\Downloader;

use BBIT\Playlist\Contracts\DownloaderContract;
use Symfony\Component\Process\Process;


/**
 * Class DownloadProcess
 * @package BBIT\Playlist\Services\Downloader
 * @method int run(callable $callback = null, array $env = [])
 * @method bool isRunning()
 * @method bool isSuccessful()
 */
class DownloadProcess
{
    /**
     * @var Process
     */
    private $proc;

    /**
     * @var DownloadRequest
     */
    private $request;

    /**
     * @var DownloaderContract
     */
    private $downloader;

    /**
     * DownloadProcess constructor.
     * @param Process $proc
     * @param DownloadRequest $request
     * @param DownloaderContract $downloader
     */
    public function __construct(Process $proc, DownloadRequest $request, DownloaderContract $downloader)
    {
        $this->proc = $proc;
        $this->request = $request;
        $this->downloader = $downloader;
    }

    /**
     * @param DownloaderContract $downloader
     * @param DownloadRequest $request
     * @return DownloadProcess
     * @throws \Exception
     */
    public static function download(DownloaderContract $downloader, DownloadRequest $request) {
        $outDir = $request->getProvider()
            ->getOutDir(
                $request->getSid()
            );

        $sid = $request->getSid();

        if ('video' == $request->getType()) {
            $proc = $downloader->download(
                $request->getProvider()
                    ->getMediumOriginUrl($sid), $sid, $outDir);
        }
        else {
            $proc = $downloader->downloadAudio(
                $request->getProvider()
                    ->getMediumOriginUrl($sid), $sid, $outDir, $request->getFormat()
            );
        }

        return new static($proc, $request, $downloader);
    }

    /**
     * @param string $name
     * @param mixed[] $arguments
     * @return mixed
     */
    public function __call(string $name, $arguments)
    {
        return $this->proc->$name(...$arguments);
    }

    /**
     * @return Process
     */
    public function getProcess(): Process
    {
        return $this->proc;
    }

    /**
     * @return DownloadRequest
     */
    public function getRequest(): DownloadRequest
    {
        return $this->request;
    }

    /**
     * @return DownloaderContract
     */
    public function getDownloader(): DownloaderContract
    {
        return $this->downloader;
    }

    /**
     *
     */
    public function finish() {
        $this->downloader->finish();
    }

}