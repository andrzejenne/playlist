<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.3.18
 * Time: 17:17
 */

namespace BBIT\Playlist\Contracts;

use BBIT\Playlist\Helpers\Process;

/**
 * Class ProcessReporterContract
 * @package BBIT\Playlist\Contracts
 */
abstract class ProcessReporterContract
{
    /** @var string */
    private $info;

    /** @var string */
    private $error;

    /**
     * @param $pipes
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

    abstract function readOutput($line);

    abstract function readErrorOutput($line);

    abstract function finish();
}