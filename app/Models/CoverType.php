<?php

namespace BBIT\Playlist\Models;

/**
 * Class CoverType
 * @package BBIT\Playlist\Models
 */
class CoverType extends BaseModel
{

    const TABLE = 'cover_types';

    const COL_ID = 'id',
        COL_SLUG = 'slug';

    const TCOL_ID = self::TABLE . '.' . self::COL_ID,
        TCOL_SLUG = self::TABLE . '.' . self::COL_SLUG;


    const REL_COVERS = 'covers';

    protected $table = self::TABLE;

    protected $fillable = [
        self::COL_SLUG,
    ];

    protected $casts = [
    ];

    public static $modelRelations = [
        self::REL_COVERS,
    ];

    protected $fields = [
        self::COL_ID,
        self::COL_SLUG,
    ];

    public $timestamps = false;

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function covers()
    {
        return $this->hasMany(Cover::class);
    }


}
