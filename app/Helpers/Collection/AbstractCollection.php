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
    public function __construct(array $args)
    {
        $this->search = isset($args['search']) ? $args['search'] : false;
        $this->limit = isset($args['limit']) ? $args['limit'] : 100;
        $this->offset = isset($args['offset']) ? $args['offset'] : 0;
    }

    /**
     * @param $args
     * @return $this
     */
    public static function create($args)
    {
        return new static($args);
    }

    /**
     * @return int
     * @throws \Exception
     */
    public final function count()
    {
        return $this->getBuilder()
            ->count();
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
        $this->getBuilder()
            ->limit($this->limit)
            ->offset($this->offset);

        return $this;
    }

    /**
     * @return LengthAwarePaginator|Builder[]|\Illuminate\Database\Eloquent\Collection
     * @throws \Exception
     */
    public function toArray()
    {
        if ($this->pagination) {
            return $this->pagination;
        } else {
            return $this->getBuilder()
                ->get();
        }
    }

    /**
     * @param array $columns
     * @return array|Builder[]|\Illuminate\Database\Eloquent\Collection
     * @throws \Exception
     */
    public function get($columns = ['*']) {
        if ($this->pagination) {
            return $this->pagination->items();
        }
        else {
            return $this->getBuilder()
                ->get($columns);
        }
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