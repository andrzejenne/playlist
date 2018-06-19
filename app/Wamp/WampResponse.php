<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 17.6.18
 * Time: 16:24
 */

namespace BBIT\Playlist\Wamp;

use Illuminate\Contracts\Support\Arrayable;


/**
 * Class WampResponse
 * @package BBIT\Playlist\Wamp
 */
class WampResponse implements Arrayable
{
    private $data;

    /**
     * @param $json
     * @return $this
     */
    public function withJson($json = null)
    {
        $this->data = $json;

        return $this;
    }

    /**
     * @return array
     */
    public function toArray()
    {
        return [
            $this->data
        ];
    }

    /**
     * @return WampResponse
     */
    public static function create()
    {
        return new static();
    }


}