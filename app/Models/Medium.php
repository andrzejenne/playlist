<?php

namespace BBIT\Playlist\Models;

/**
 * Class Medium
 * @package BBIT\Playlist\Models
 */
class Medium extends BaseModel
{
    
    const TABLE = 'media';

    const COL_ID = 'id',
		  COL_NAME = 'name',
		  COL_ARTIST_ID = 'artist_id',
		  COL_ALBUM_ID = 'album_id',
		  COL_GENRE_ID = 'genre_id',
		  COL_RELEASED = 'released',
		  COL_CREATED_AT = 'created_at',
		  COL_UPDATED_AT = 'updated_at';

	const TCOL_ID = self::TABLE . '.' . self::COL_ID,
		  TCOL_NAME = self::TABLE . '.' . self::COL_NAME,
		  TCOL_ARTIST_ID = self::TABLE . '.' . self::COL_ARTIST_ID,
		  TCOL_ALBUM_ID = self::TABLE . '.' . self::COL_ALBUM_ID,
		  TCOL_GENRE_ID = self::TABLE . '.' . self::COL_GENRE_ID,
		  TCOL_RELEASED = self::TABLE . '.' . self::COL_RELEASED,
		  TCOL_CREATED_AT = self::TABLE . '.' . self::COL_CREATED_AT,
		  TCOL_UPDATED_AT = self::TABLE . '.' . self::COL_UPDATED_AT;


    const REL_ARTIST = 'artist',
		  REL_ALBUM = 'album',
		  REL_GENRE = 'genre';

    protected $table = self::TABLE;
    
    protected $fillable = [
		self::COL_NAME,
		self::COL_ARTIST_ID,
		self::COL_ALBUM_ID,
		self::COL_GENRE_ID,
		self::COL_RELEASED,
	];

    protected $casts = [
		self::COL_RELEASED => self::CAST_DATE,
	];

    public static $modelRelations = [
		  self::REL_ARTIST,
		  self::REL_ALBUM,
		  self::REL_GENRE,
	];

    protected $fields = [
		self::COL_ID,
		self::COL_NAME,
		self::COL_ARTIST_ID,
		self::COL_ALBUM_ID,
		self::COL_GENRE_ID,
		self::COL_RELEASED,
		self::COL_CREATED_AT,
		self::COL_UPDATED_AT,
	];

    	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function artist()
	{
		return $this->belongsTo(Artist::class, self::COL_ARTIST_ID);
	}

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
	public function genre()
	{
		return $this->belongsTo(Genre::class, self::COL_GENRE_ID);
	}


}
