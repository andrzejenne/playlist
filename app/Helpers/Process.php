<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 15.3.18
 * Time: 14:40
 */

namespace BBIT\Playlist\Helpers;

/**
 * Class Process
 * @package App\Service
 */
class Process
{
    const CMD_NOT_FOUND = 127;

    const READ_MODE = 'r',
        WRITE_MODE = 'w',
        APPEND_MODE = 'a';

    /** @var string */
    private $cmd;

    /** @var array */
    private $fifo = [];

    /** @var */
    private $cwd;

    /** @var */
    private $env = [];

    /** @var resource */
    private $resource;

    /** @var string */
    private $error;

    /** @var string */
    private $info;

    /** @var string */
    private $executed;

    /** @var int */
    private $status = -1;

    /** @var  */
    private $stdOutReader;

    /** @var  */
    private $stdErrReader;

    /**
     * Process constructor.
     * @param $cmd
     */
    public function __construct($cmd)
    {
        $this->cmd = $cmd;
    }

    /**
     * @param $cmd
     * @return Process
     */
    public static function prepare($cmd)
    {
        return new static($cmd);
    }

    /**
     * @param $cmdWithArgs
     * @return bool|Process
     */
    public static function run($cmdWithArgs)
    {
        $args = explode(' ', $cmdWithArgs);
        $cmd = array_shift($args);

        try {
            return static::prepare($cmd)
                ->enableOutput()
                ->enableErrorOutput()
                ->execute($args);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * @param array ...$args
     * @return Process
     * @throws \Exception
     */
    public function execute(...$args)
    {
        if (!$this->executed) {
            $argStr = count($args) ? ' ' . implode(' ', $args) : null;

            $this->resource = proc_open($this->cmd . $argStr, $this->fifo, $pipes, $this->cwd, $this->env);

            $stdOutEnabled = isset($this->fifo[1]);
            $stdErrEnabled = isset($this->fifo[2]);

            if (!$this->stdOutReader && !$this->stdErrReader) {
                if ($stdOutEnabled) {
                    $this->info = stream_get_contents($pipes[1]);
                }
                if ($stdErrEnabled) {
                    $this->error = stream_get_contents($pipes[2]);
                }
            }
            else {
                $iCallback = $this->stdOutReader;
                $eCallback = $this->stdErrReader;
                while (
                    ($stdOutEnabled && $this->stdOutReader && !feof($pipes[1]))
                    || ($stdErrEnabled && $this->stdErrReader && !feof($pipes[2]))
                ) {
                    $iLine = fgets($pipes[1]);
                    $eLine = fgets($pipes[2]);
                    if (!empty($iLine) && $this->stdOutReader) {
                        $this->info .= $iLine . "\n";
                        $iCallback($iLine);
                    }
                    if (!empty($eLine) && $this->stdErrReader) {
                        $this->error .= $eLine . "\n";
                        $eCallback($eLine);
                    }
                }
            }

            $this->executed = true;

            foreach ($pipes as $pipe) {
                fclose($pipe);
            }

            $this->status = proc_close($this->resource);

        } else {
            throw new \Exception('command allready done');
        }

        return $this;
    }

    /**
     * @param $path
     * @return Process
     */
    public function enableInput($path = null)
    {
        $this->fifo[0] = static::createDescriptor($path, self::READ_MODE);

        return $this;
    }

    /**
     * @param $path
     * @param null $reader
     * @return $this
     */
    public function enableOutput($path = null, $reader = null)
    {
        $this->fifo[1] = static::createDescriptor($path, self::WRITE_MODE);
        $this->stdOutReader = $reader;

        return $this;
    }

    /**
     * @param $path
     * @param null $reader
     * @param string $mode
     * @return $this
     */
    public function enableErrorOutput($path = null, $reader = null, $mode = self::WRITE_MODE)
    {
        $this->fifo[2] = static::createDescriptor($path, $mode);
        $this->stdErrReader = $reader;

        return $this;
    }

    /**
     * @param $cwd
     * @return $this
     */
    public function setWorkingDir($cwd)
    {
        $this->cwd = $cwd;

        return $this;
    }

    /**
     * @param array $env
     * @return $this
     */
    public function setEnv(array $env)
    {
        $this->env = $env;

        return $this;
    }

    /**
     * @return bool
     */
    public function success()
    {
        return empty($this->error);
    }

    /**
     * @return null|string
     */
    public function info()
    {
        if ($this->executed) {
            return $this->info;
        }

        return null;
    }

    /**
     * @return string
     */
    public function report()
    {
        return $this->info() . $this->error();
    }

    /**
     * @return int
     */
    public function status()
    {
        return $this->status;
    }

    /**
     * @return null|string
     */
    public function error()
    {
        if ($this->executed) {
            return $this->error;
        }

        return null;
    }

    /**
     * @param $path
     * @param $mode
     * @return array
     */
    private static function createDescriptor($path, $mode)
    {
        if (!$path) {
            return ['pipe', $mode];
        } else {
            return ['file', $path, $mode];
        }
    }

}