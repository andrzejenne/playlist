<?php

namespace BBIT\Playlist\Models;

/**
 * Class Genre
 *
 * @package BBIT\Playlist\Models
 * @property int $id
 * @property string $name
 * @property-read \Illuminate\Database\Eloquent\Collection|\BBIT\Playlist\Models\Album[] $albums
 * @property-read array $count
 * @property-read \Illuminate\Database\Eloquent\Collection|\BBIT\Playlist\Models\Medium[] $media
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Genre whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Genre whereName($value)
 * @mixin \Eloquent
 */
class Genre extends BaseModel
{

    const TABLE = 'genres';

    const COL_ID = 'id',
        COL_NAME = 'name';

    const TCOL_ID = self::TABLE . '.' . self::COL_ID,
        TCOL_NAME = self::TABLE . '.' . self::COL_NAME;


    const REL_ALBUMS = 'albums',
        REL_MEDIA = 'media';

    protected $table = self::TABLE;

    protected $fillable = [
        self::COL_NAME,
    ];

    protected $casts = [
    ];

    public static $modelRelations = [
        self::REL_ALBUMS,
        self::REL_MEDIA,
    ];

    protected $fields = [
        self::COL_ID,
        self::COL_NAME,
    ];

    public $timestamps = false;

    protected $appends = [
        'count'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function albums()
    {
        return $this->hasMany(Album::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function media()
    {
        return $this->hasMany(Medium::class);
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
