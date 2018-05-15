<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 15.5.18
 * Time: 8:16
 */

namespace BBIT\Playlist\Models\Views\Medium;


use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Models\Views\EloquentView;

/**
 * Class MediumView
 * @package BBIT\Playlist\Models\Views\Medium
 */
class MediumView extends EloquentView
{
    /**
     * MediumView constructor.
     * @param Medium $model
     */
    public function __construct(Medium $model)
    {
        parent::__construct($model);
    }


}