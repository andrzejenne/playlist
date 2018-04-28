<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 14:39
 */

namespace BBIT\Playlist\Contracts;

use BBIT\Playlist\Models\MediaProvider;
use Illuminate\Support\Collection;
use Symfony\Component\Process\Process;

/**
 * Class DownloaderContract
 * @package BBIT\Playlist\Contracts
 */
abstract class DownloaderContract
{
    /** @var MediaProvider */
    private $provider;

    /**
     * @param $sid
     * @return Process
     * @throws \Exception
     */
    abstract public function download($sid);

    /**
     * @param $sid
     * @param string $format
     * @return string
     * @throws \Exception
     */
    abstract public function downloadAudio($sid, $format = 'mp3');

    /**
     * @param $sid
     * @return Collection
     */
    abstract public function getVideos($sid);

    /**
     * @param $sid
     * @return Collection
     */
    abstract public function getAudios($sid);

    /**
     * @param $sid
     * @return string
     */
    abstract public function getName($sid);

    /**
     * @return void
     */
    abstract public function finish();

    /**
     * @return string
     */
    abstract public function getProviderSlug();

    /**
     * @return MediaProvider
     */
    final public function getProvider() {
        if (!$this->provider) {
            $this->provider = MediaProvider::whereSlug($this->getProviderSlug())->first();
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
            $callback = function($type, $buffer) use ($reporter) {
                if (Process::ERR == $type) {
                    $reporter->readErrorOutput($buffer);
                }
                else {
                    $reporter->readOutput($buffer);
                }
            };
        }
        $cmd->enableOutput()
            ->start($callback);

        return $cmd;
    }

}