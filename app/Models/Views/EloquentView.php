<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 15.5.18
 * Time: 8:13
 */

namespace BBIT\Playlist\Models\Views;

use BBIT\Playlist\Models\BaseModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;


/**
 * Class EloquentView
 * @package BBIT\Playlist\Models\Views
 */
abstract class EloquentView
{
    /** @var BaseModel */
    protected $model;

    /** @var array */
    protected $with;

    /** @var Builder */
    private $query;

    /** @var boolean */
    private $finished;

    /** @var array */
    private static $finishing = [
        'get',
        'first',
        'firstOr',
        'firstOrNew',
        'firstOrCreate',
        'firstOrFail',
        'delete',
        'forceDelete'
    ];

    /**
     * EloquentView constructor.
     * @param BaseModel $model
     */
    public function __construct(BaseModel $model)
    {
        $this->model = $model;
    }


    /**
     * @param $name
     * @param $arguments
     * @return mixed
     */
    public function __call($name, $arguments)
    {
//        $result = $this->getQuery()->{$name}(...$arguments);

        $result = $this->model->{$name}(...$arguments);

//        if (in_array($name, self::$finishing)) {
//            $this->finished = true;
//
//        }

//        $this->mangle($result);

        return $result;
    }

    /**
     * @return Builder
     */
    protected function getQuery()
    {
        if ($this->finished || !$this->query) {
//            $this->query = $this->model->query();

            $this->finished = false;

            $this->onNewQuery($this->query);
        }

        return $this->query;
    }

    protected function onNewQuery(Builder $query)
    {

    }

    protected function mangle($result)
    {
        if ($result instanceof BaseModel) {
            $this->mangleRecord($result);
        } else {
            if ($result instanceof Collection) {
                $result->each(function (BaseModel $record) {
                    $this->mangleRecord($record);
                });
            }
            else if ($result instanceof Builder) {
                $this->mangleBuilder($result);
            }
        }
    }

    protected function mangleRecord(BaseModel $record)
    {

    }

    protected function mangleBuilder(Builder $record)
    {

    }
}