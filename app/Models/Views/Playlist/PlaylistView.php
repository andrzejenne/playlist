<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 15.5.18
 * Time: 8:16
 */

namespace BBIT\Playlist\Models\Views\Playlist;


use BBIT\Playlist\Models\BaseModel;
use BBIT\Playlist\Models\Playlist;
use BBIT\Playlist\Models\Views\EloquentView;
use Illuminate\Database\Eloquent\Builder;

/**
 * Class PlaylistView
 * @package BBIT\Playlist\Models\Views\Medium
 */
class PlaylistView extends EloquentView
{
    /**
     * MediumView constructor.
     * @param Playlist $model
     */
    public function __construct(Playlist $model)
    {
        parent::__construct($model);

        $this->mangleRecord($model);
    }


    /**
     * @param BaseModel $record
     */
    protected function mangleRecord(BaseModel $record)
    {
        parent::mangleRecord($record);

        $record->append(Playlist::A_COUNT, Playlist::A_DURATION);
    }
//
//    /**
//     * @param Builder $builder
//     */
//    protected function mangleBuilder(Builder $builder)
//    {
//        $this->mangleRecord(
//            $builder->getModel()
//        );
//    }


}