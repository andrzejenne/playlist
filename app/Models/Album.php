<?php

namespace BBIT\Playlist\Models;

/**
 * Class Album
 *
 * @package BBIT\Playlist\Models
 * @property int $id
 * @property string $name
 * @property \Carbon\Carbon $released
 * @property int|null $duration
 * @property int|null $genre_id
 * @property int|null $artist_id
 * @property-read \BBIT\Playlist\Models\Artist|null $artist
 * @property-read \Illuminate\Database\Eloquent\Collection|\BBIT\Playlist\Models\Cover[] $covers
 * @property-read \BBIT\Playlist\Models\Genre|null $genre
 * @property-read int $count
 * @property-read \Illuminate\Database\Eloquent\Collection|\BBIT\Playlist\Models\LibraryAlbum[] $libraries
 * @property-read \Illuminate\Database\Eloquent\Collection|\BBIT\Playlist\Models\Medium[] $media
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Album whereArtistId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Album whereDuration($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Album whereGenreId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Album whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Album whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Album whereReleased($value)
 * @mixin \Eloquent
 */
class Album extends BaseModel
{

    const TABLE = 'albums';

    const COL_ID = 'id',
        COL_NAME = 'name',
        COL_RELEASED = 'released',
        COL_DURATION = 'duration',
        COL_GENRE_ID = 'genre_id',
        COL_ARTIST_ID = 'artist_id',
        COL_CREATED_AT = 'created_at',
        COL_UPDATED_AT = 'updated_at';

    const TCOL_ID = self::TABLE . '.' . self::COL_ID,
        TCOL_NAME = self::TABLE . '.' . self::COL_NAME,
        TCOL_RELEASED = self::TABLE . '.' . self::COL_RELEASED,
        TCOL_DURATION = self::TABLE .'.'. self::COL_DURATION,
        TCOL_GENRE_ID = self::TABLE . '.' . self::COL_GENRE_ID,
        TCOL_ARTIST_ID = self::TABLE . '.' . self::COL_ARTIST_ID,
        TCOL_CREATED_AT = self::TABLE . '.' . self::COL_CREATED_AT,
        TCOL_UPDATED_AT = self::TABLE . '.' . self::COL_UPDATED_AT;


    const
        REL_COVERS = 'covers',
        REL_MEDIA = 'media',
        REL_GENRE = 'genre',
        REL_ARTIST = 'artist',
        REL_LIBRARIES = 'libraries';

    protected $table = self::TABLE;

    protected $fillable = [
        self::COL_NAME,
        self::COL_RELEASED,
        self::COL_GENRE_ID,
        self::COL_ARTIST_ID
    ];

    protected $casts = [
        self::COL_RELEASED => self::CAST_DATE,
    ];

    public static $modelRelations = [
        self::REL_MEDIA,
        self::REL_GENRE,
        self::REL_ARTIST,
        self::REL_LIBRARIES
    ];

    protected $fields = [
        self::COL_ID,
        self::COL_NAME,
        self::COL_RELEASED,
        self::COL_GENRE_ID,
        self::COL_ARTIST_ID,
        self::COL_CREATED_AT,
        self::COL_UPDATED_AT,
    ];

    public $timestamps = false;

    protected $with = [
        self::REL_COVERS
    ];

    protected $appends = [
        'count'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function media()
    {
        return $this->hasMany(Medium::class, Medium::COL_ALBUM_ID);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function genre()
    {
        return $this->belongsTo(Genre::class, self::COL_GENRE_ID);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function artist()
    {
        return $this->belongsTo(Artist::class, self::COL_ARTIST_ID);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function libraries()
    {
        return $this->hasMany(LibraryAlbum::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function covers()
    {
        return $this->hasMany(Cover::class);
    }

    /**
     * @return int
     */
    public function getCountAttribute()
    {
        return $this->media()->count();
    }

}
