<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 15.3.18
 * Time: 14:40
 */

namespace BBIT\Playlist\Helpers;

use BBIT\Playlist\Contracts\ProcessReporterContract;

/**
 * Class Process
 * @package App\Service
 * @deprecated
 */
class Process
{
    const CMD_NOT_FOUND = 127;

    const READ_MODE = 'r',
        WRITE_MODE = 'w',
        APPEND_MODE = 'a';

    const INPUT = 0,
        OUTPUT = 1,
        ERROR_OUTPUT = 2;

    /** @var string */
    private $cmd;

    /** @var array */
    private $fifo = [];

    /** @var string|null */
    private $cwd;

    /** @var mixed[] */
    private $env = [];

    /** @var resource */
    private $resource;

    /** @var string */
    private $error;

    /** @var string */
    private $info;

    /** @var bool */
    private $executed;

    /** @var int */
    private $status = -1;

    /** @var ProcessReporterContract */
    private $reporter;

    /**
     * Process constructor.
     * @param string $cmd
     */
    public function __construct($cmd)
    {
        $this->cmd = $cmd;
    }

    /**
     * @param string $cmd
     * @return Process
     */
    public static function prepare($cmd)
    {
        return new static($cmd);
    }

    /**
     * @param string $cmdWithArgs
     * @param string|null $cwd
     * @return bool|Process
     */
    public static function run($cmdWithArgs, $cwd = null)
    {
        $args = explode(' ', $cmdWithArgs);
        $cmd = array_shift($args);

        try {
            return static::prepare($cmd)
                ->enableOutput()
                ->enableErrorOutput()
                ->setWorkingDir($cwd)
                ->execute($args);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * @param string[] ...$args
     * @return Process
     * @throws \Exception
     */
    public function execute(...$args)
    {
        if (!$this->executed) {
            $argStr = count($args) ? ' ' . implode(' ', $args) : null;

            $this->resource = proc_open($this->cmd . $argStr, $this->fifo, $pipes, $this->cwd, getenv() + $this->env);

            $stdOutEnabled = isset($this->fifo[static::OUTPUT]);
            $stdErrEnabled = isset($this->fifo[static::ERROR_OUTPUT]);

            if ($this->reporter) {
                $this->reporter->report($pipes);
                $this->info = $this->reporter->info();
                $this->error = $this->reporter->error();
            }
            else {
                if ($stdOutEnabled) {
                    $this->info = stream_get_contents($pipes[1]);
                }
                if ($stdErrEnabled) {
                    $this->error = stream_get_contents($pipes[2]);
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
     * @param string|null $path
     * @return Process
     */
    public function enableInput($path = null)
    {
        $this->fifo[static::INPUT] = static::createDescriptor($path, self::READ_MODE);

        return $this;
    }

    /**
     * @param string|null $path
     * @return $this
     */
    public function enableOutput($path = null)
    {
        $this->fifo[static::OUTPUT] = static::createDescriptor($path, self::WRITE_MODE);

        return $this;
    }

    /**
     * @param string|null $path
     * @param string $mode
     * @return $this
     */
    public function enableErrorOutput($path = null, $mode = self::WRITE_MODE)
    {
        $this->fifo[static::ERROR_OUTPUT] = static::createDescriptor($path, $mode);

        return $this;
    }

    /**
     * @param string|null $cwd
     * @return $this
     */
    public function setWorkingDir(?string $cwd = null)
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
     * @param string|null $path
     * @param string $mode
     * @return array
     */
    private static function createDescriptor(?string $path = null, string $mode)
    {
        if (!$path) {
            return ['pipe', $mode];
        } else {
            return ['file', $path, $mode];
        }
    }

}