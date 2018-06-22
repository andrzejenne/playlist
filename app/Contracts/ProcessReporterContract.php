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
abstract class ProcessReporterContract
{
    protected $progress = 0;

    protected $started = false;

    protected $finished = false;

    /** @var string */
    private $info;

    /** @var string */
    private $error;

    /**
     * @param mixed $pipes
     * @deprecated
     */
    final public function report($pipes) {
        $stdOutEnabled = isset($pipes[Process::OUTPUT]);
        $stdErrEnabled = isset($pipes[Process::ERROR_OUTPUT]);

        while (
            ($stdOutEnabled && !feof($pipes[Process::OUTPUT]))
            || ($stdErrEnabled && !feof($pipes[Process::INPUT]))
        ) {
            $iLine = fgets($pipes[Process::OUTPUT]);
            $eLine = fgets($pipes[Process::INPUT]);
            if (!empty($iLine)) {
                $this->info .= $iLine;
                $this->readOutput($iLine);
            }
            if (!empty($eLine)) {
                $this->error .= $eLine;
                $this->readErrorOutput($eLine);
            }
        }

        $this->finish();
    }

    /**
     * @return string
     * @deprecated
     */
    final public function info() {
        return $this->info;
    }

    /**
     * @return string
     * @deprecated
     */
    final public function error() {
        return $this->error;
    }

    abstract function readOutput(string $line);

    abstract function readErrorOutput(string $line);

    abstract function finish();
}