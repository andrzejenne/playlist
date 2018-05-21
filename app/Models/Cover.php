<?php

namespace BBIT\Playlist\Models;

/**
 * Class Cover
 * @package BBIT\Playlist\Models
 */
class Cover extends BaseModel
{

    const TABLE = 'covers';

    const COL_ID = 'id',
        COL_ALBUM_ID = 'album_id',
        COL_COVER_TYPE_ID = 'cover_type_id';

    const TCOL_ID = self::TABLE . '.' . self::COL_ID,
        TCOL_ALBUM_ID = self::TABLE . '.' . self::COL_ALBUM_ID,
        TCOL_COVER_TYPE_ID = self::TABLE . '.' . self::COL_COVER_TYPE_ID;


    const REL_ALBUM = 'album',
        REL_TYPE = 'type';

    protected $table = self::TABLE;

    protected $fillable = [
        self::COL_ALBUM_ID,
        self::COL_COVER_TYPE_ID,
    ];

    protected $casts = [
    ];

    public static $modelRelations = [
        self::REL_ALBUM,
        self::REL_TYPE,
    ];

    protected $fields = [
        self::COL_ID,
        self::COL_ALBUM_ID,
        self::COL_COVER_TYPE_ID,
    ];

    protected $with = [
        self::REL_TYPE
    ];

    public $timestamps = false;

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function album()
    {
        return $this->belongsTo(Album::class, self::COL_ALBUM_ID);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function type()
    {
        return $this->belongsTo(CoverType::class, self::COL_COVER_TYPE_ID);
    }


}
