<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 17.6.18
 * Time: 16:27
 */

namespace BBIT\Playlist\Wamp;


/**
 * Class WampRequest
 * @package BBIT\Playlist\Wamp
 */
class WampRequest
{
    private $args;
    private $argsKW;

    /**
     * WampRequest constructor.
     * @param mixed $args
     * @param mixed $argsKW
     */
    public function __construct($args, $argsKW)
    {
        $this->args = $args;
        $this->argsKW = $argsKW;
    }

    /**
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function getArgument(string $key, $default = null)
    {
        return isset($this->args->$key) ? $this->args->$key : $default;
    }

    /**
     * @return array
     */
    public function getArguments()
    {
        return (array)$this->args;
    }

    /**
     * @param string $key
     * @return bool
     */
    public function hasArgument(string $key)
    {
        return isset($this->args->$key);
    }

    /**
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function getArgumentKW(string $key, $default = null)
    {
        return isset($this->argsKW->$key) ? $this->argsKW->$key : $default;
    }

    /**
     * @return array
     */
    public function getArgumentsKW()
    {
        return (array)$this->argsKW;
    }

    /**
     * @param mixed ...$args
     * @return WampRequest
     */
    public static function create(...$args)
    {
        $argsKW = isset($args[1]) ? $args[1] : null;
        $args = isset($args[0][0]) ? $args[0][0] : null;

        return new static($args, $argsKW);
    }
}