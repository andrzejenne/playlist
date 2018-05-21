<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 11.3.18
 * Time: 12:58
 */

namespace BBIT\Playlist\Models;


use Illuminate\Database\Eloquent\Model;

/**
 * Class BaseModel
 * @package BBIT\Playlist\Models
 */
class BaseModel extends Model
{
    const COL_ID = 'id',
        COL_CREATED_AT = 'created_at',
        COL_UPDATED_AT = 'updated_at',
        COL_DELETED_AT = 'deleted_at';

    const CAST_DATE = 'date',
        CAST_ARRAY = 'array',
        CAST_FLOAT = 'float',
        CAST_INTEGER = 'integer',
        CAST_BOOLEAN = 'boolean';

    /**
     * @return integer
     */
    public function getId()
    {
        return $this->getAttribute(self::COL_ID);
    }
}