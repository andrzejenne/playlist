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
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder;


/**
 * Class AbstractCollection
 * @package BBIT\Playlist\Helpers\Collection
 * @method \Eloquent first()
 * @method AbstractCollection orderBy($arg1, $arg2)
 * @mixin \Eloquent
 */
abstract class AbstractCollection implements Arrayable
{
    protected $offset = 0;

    protected $limit = 100;

    /** @var Builder|EloquentBuilder */
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
     * @param mixed[] $args
     */
    public function __construct(array $args)
    {
        $this->search = isset($args['search']) ? $args['search'] : false;
        $this->limit = isset($args['limit']) ? $args['limit'] : 100;
        $this->offset = isset($args['offset']) ? $args['offset'] : 0;
    }

    /**
     * @param mixed $args
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
     * @return array|LengthAwarePaginator|EloquentBuilder[]|\Illuminate\Database\Eloquent\Collection|\Illuminate\Support\Collection
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
     * @return array|EloquentBuilder[]|\Illuminate\Database\Eloquent\Collection|\Illuminate\Support\Collection
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
     * @param string $name
     * @param mixed[] $arguments
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
     * @return Builder|EloquentBuilder
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