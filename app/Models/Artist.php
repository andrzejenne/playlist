<?php

namespace BBIT\Playlist\Models;

/**
 * Class Artist
 *
 * @package BBIT\Playlist\Models
 * @property int $id
 * @property string $name
 * @property-read \Illuminate\Database\Eloquent\Collection|\BBIT\Playlist\Models\Album[] $albums
 * @property-read array $count
 * @property-read \Illuminate\Database\Eloquent\Collection|\BBIT\Playlist\Models\Medium[] $media
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Artist whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Artist whereName($value)
 * @mixin \Eloquent
 */
class Artist extends BaseModel
{

    const TABLE = 'artists';

    const COL_ID = 'id',
        COL_NAME = 'name',
        COL_CREATED_AT = 'created_at',
        COL_UPDATED_AT = 'updated_at';

    const TCOL_ID = self::TABLE . '.' . self::COL_ID,
        TCOL_NAME = self::TABLE . '.' . self::COL_NAME,
        TCOL_CREATED_AT = self::TABLE . '.' . self::COL_CREATED_AT,
        TCOL_UPDATED_AT = self::TABLE . '.' . self::COL_UPDATED_AT;


    const REL_MEDIA = 'media',
        REL_ALBUMS = 'albums';

    protected $table = self::TABLE;

    protected $fillable = [
        self::COL_NAME,
    ];

    protected $casts = [
    ];

    public static $modelRelations = [
        self::REL_MEDIA,
    ];

    protected $fields = [
        self::COL_ID,
        self::COL_NAME,
        self::COL_CREATED_AT,
        self::COL_UPDATED_AT,
    ];

    public $timestamps = false;

    protected $appends = [
        'count'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function media()
    {
        return $this->hasMany(Medium::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function albums()
    {
        return $this->hasMany(Album::class);
    }

    /**
     * @return array
     */
    public function getCountAttribute()
    {
        return [
            'media' => $this->media()->count(),
            'albums' => $this->albums()->count()
        ];
    }


}
