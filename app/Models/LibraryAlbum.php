<?php

namespace BBIT\Playlist\Models;

/**
 * Class LibraryAlbum
 *
 * @package BBIT\Playlist\Models
 * @property int $id
 * @property string $sid
 * @property string $path
 * @property int|null $album_id
 * @property-read \BBIT\Playlist\Models\Album|null $album
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\LibraryAlbum whereAlbumId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\LibraryAlbum whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\LibraryAlbum wherePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\LibraryAlbum whereSid($value)
 * @mixin \Eloquent
 */
class LibraryAlbum extends BaseModel
{

    const TABLE = 'library_albums';

    const COL_ID = 'id',
        COL_SID = 'sid',
        COL_PATH = 'path',
        COL_ALBUM_ID = 'album_id';

    const TCOL_ID = self::TABLE . '.' . self::COL_ID,
        TCOL_SID = self::TABLE . '.' . self::COL_SID,
        TCOL_PATH = self::TABLE . '.' . self::COL_PATH,
        TCOL_ALBUM_ID = self::TABLE . '.' . self::COL_ALBUM_ID;


    const REL_ALBUM = 'album';

    protected $table = self::TABLE;

    protected $fillable = [
        self::COL_SID,
        self::COL_PATH,
        self::COL_ALBUM_ID,
    ];

    protected $casts = [
    ];

    public static $modelRelations = [
        self::REL_ALBUM,
    ];

    protected $fields = [
        self::COL_ID,
        self::COL_SID,
        self::COL_PATH,
        self::COL_ALBUM_ID,
    ];

    public $timestamps = false;

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function album()
    {
        return $this->belongsTo(Album::class, self::COL_ALBUM_ID);
    }


}
