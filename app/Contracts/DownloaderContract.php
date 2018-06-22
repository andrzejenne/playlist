<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 14:39
 */

namespace BBIT\Playlist\Contracts;

use BBIT\Playlist\Models\MediaProvider;
use BBIT\Playlist\Providers\MediaLibraryProvider;
use Illuminate\Support\Collection;
use Symfony\Component\Process\Process;

/**
 * Class DownloaderContract
 * @package BBIT\Playlist\Contracts
 */
abstract class DownloaderContract
{
    /** @var MediaProviderContract */
    private $provider;
    /**
     * @var MediaLibraryProvider
     */
    private $libraryProvider;

    /**
     * DownloaderContract constructor.
     * @param MediaLibraryProvider $libraryProvider
     */
    public function __construct(MediaLibraryProvider $libraryProvider)
    {
        $this->libraryProvider = $libraryProvider;
    }


    /**
     * @param string $url
     * @param string $sid
     * @param string $outDir
     * @return Process|null
     */
    abstract public function download(string $url, string $sid, string $outDir);

    /**
     * @param string $url
     * @param string $sid
     * @param string $outDir
     * @param string $format
     * @return Process|null
     */
    abstract public function downloadAudio(string $url, string $sid, string $outDir, string $format = 'mp3');

    /**
     * @param string $url
     * @param string $sid
     * @return Collection
     */
    abstract public function getVideos(string $url, string $sid);

    /**
     * @param string $url
     * @param string $sid
     * @return Collection
     */
    abstract public function getAudios(string $url, string $sid);

    /**
     * @param string $url
     * @param string $sid
     * @return string
     */
    abstract public function getName(string $url, string $sid);

    /**
     * @return void
     */
    abstract public function finish();

    /**
     * @return string
     */
    abstract public function getProviderSlug();


    /**
     * @return MediaProviderContract
     */
    final public function getProvider()
    {
        if (!$this->provider) {
            $this->provider = $this->libraryProvider->getService($this->getProviderSlug());
        }

        return $this->provider;
    }

    /**
     * @param Process $cmd
     * @param ProcessReporterContract|null $reporter
     * @return Process
     */
    protected static final function run(Process $cmd, ProcessReporterContract $reporter = null)
    {
        $callback = null;
        if ($reporter) {
            $callback = function ($type, $buffer) use ($reporter) {
                if (Process::ERR == $type) {
                    $reporter->readErrorOutput($buffer);
                } else {
                    $reporter->readOutput($buffer);
                }
            };
        }
        $cmd->enableOutput()
            ->start($callback);

        return $cmd;
    }

}