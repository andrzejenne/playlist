<?php

namespace BBIT\Playlist\Models;

use BBIT\Playlist\Models\Traits\HasSlug;

/**
 * Class MediaFileType
 *
 * @package BBIT\Playlist\Models
 * @property int $id
 * @property string $slug
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\MediaFileType whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\MediaFileType whereSlug($value)
 * @mixin \Eloquent
 */
class MediaFileType extends BaseModel
{
    use HasSlug;

    const TABLE = 'media_file_types';

    const COL_ID = 'id',
        COL_SLUG = 'slug';

    const TCOL_ID = self::TABLE . '.' . self::COL_ID,
        TCOL_SLUG = self::TABLE . '.' . self::COL_SLUG;

    protected $table = self::TABLE;

    protected $fillable = [
        self::COL_SLUG,
    ];

    public $timestamps = false;

    protected $casts = [

    ];

    protected $fields = [
        self::COL_ID,
        self::COL_SLUG,
    ];
}
