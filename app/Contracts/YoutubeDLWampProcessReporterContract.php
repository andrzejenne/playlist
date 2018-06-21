<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 17:17
 */

namespace BBIT\Playlist\Contracts;

use BBIT\Playlist\Helpers\Process;
use Thruway\ClientSession;

/**
 * Class ProcessReporterContract
 * @package BBIT\Playlist\Contracts
 */
abstract class YoutubeDLWampProcessReporterContract extends WampProcessReporterContract
{
    const EVENT_START = 'download.started',
        EVENT_FINISH = 'download.finished',
        EVENT_PROGRESS = 'download.progress',
        EVENT_ERROR = 'download.error',
        EVENT_STATUS = 'download.status',
        EVENT_FILENAME = 'download.filename';

    /** @var string|null */
    private $url;

    /**
     * @param string|null $url
     * @return YoutubeDLWampProcessReporterContract
     */
    final public function setUrl(?string $url = null)
    {
        $this->url = $url;

        return $this;
    }

    /**
     * @return string|null
     */
    public function getUrl(): ?string
    {
        return $this->url;
    }

    /**
     *
     */
    public function restart()
    {
        parent::restart();

        $this->setUrl();
    }

}