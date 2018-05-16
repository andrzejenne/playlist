<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 16.5.18
 * Time: 8:55
 */

namespace BBIT\Playlist\Helpers\Collection;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Database\Eloquent\Builder;


/**
 * Class AbstractCollection
 * @package BBIT\Playlist\Helpers\Collection
 */
abstract class AbstractCollection implements Arrayable
{
    protected $offset = 0;

    protected $limit = 100;

    /** @var Builder */
    protected $builder;

    protected $search;

    /** @var LengthAwarePaginator */
    protected $pagination;

    private static $finals = [
        'get',
        'first'
    ];

    /**
     * MediaCollection constructor.
     * @param $args
     */
    public function __construct($args)
    {
        $this->search = isset($args->search) ? $args->search : false;
        $this->limit = isset($args->limit) ? $args->limit : 100;
        $this->offset = isset($args->offset) ? $args->offset : 0;
    }

    /**
     * @param $args
     * @return $this
     */
    public static function create($args)
    {
        return new static($args[0]);
    }

    /**
     * @return $this
     */
    abstract public function search();

    /**
     * @return $this
     * @throws \Exception
     */
    public function paginate()
    {
        $this->pagination = $this->getBuilder()->paginate(
            $this->limit, ['*'], 'page', floor($this->offset / $this->limit) + 1);

        return $this;
    }

    /**
     * @return array
     * @throws \Exception
     */
    public function toArray()
    {
        return $this->getBuilder()
            ->get()
            ->toArray();
    }

    /**
     * @param $name
     * @param $arguments
     * @return $this|mixed
     * @throws \Exception
     */
    public function __call($name, $arguments)
    {
        $result = $this->getBuilder()->{$name}(...$arguments);

        if (in_array($name, self::$finals)) {
            return $result;
        }

        return $this;
    }

    /**
     * @return Builder
     * @throws \Exception
     */
    protected function getBuilder()
    {
        if (!$this->builder) {
            throw new \Exception('getBuilder not implemented');
        }

        return $this->builder;
    }
}