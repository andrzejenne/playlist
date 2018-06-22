<?php

namespace BBIT\Playlist\Models;

/**
 * Class MediaType
 *
 * @package BBIT\Playlist\Models
 * @property int $id
 * @property string $name
 * @property string $slug
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\MediaType whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\MediaType whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\MediaType whereSlug($value)
 * @mixin \Eloquent
 */
class MediaType extends BaseModel
{

    const TABLE = 'media_types';

    const COL_ID = 'id',
        COL_NAME = 'name',
        COL_SLUG = 'slug';

    const TCOL_ID = self::TABLE . '.' . self::COL_ID,
        TCOL_NAME = self::TABLE . '.' . self::COL_NAME,
        TCOL_SLUG = self::TABLE . '.' . self::COL_SLUG;

    public $timestamps = false;

    protected $table = self::TABLE;

    protected $fillable = [
        self::COL_NAME,
        self::COL_SLUG,
    ];

    protected $casts = [
    ];


    protected $fields = [
        self::COL_ID,
        self::COL_NAME,
        self::COL_SLUG,
    ];


}
