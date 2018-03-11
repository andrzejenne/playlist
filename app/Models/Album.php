<?php

namespace BBIT\Playlist\Models;

/**
 * Class Album
 * @package BBIT\Playlist\Models
 */
class Album extends BaseModel
{
    
    const TABLE = 'albums';

    const COL_ID = 'id',
		  COL_NAME = 'name',
		  COL_RELEASED = 'released',
		  COL_GENRE_ID = 'genre_id',
		  COL_CREATED_AT = 'created_at',
		  COL_UPDATED_AT = 'updated_at';

	const TCOL_ID = self::TABLE . '.' . self::COL_ID,
		  TCOL_NAME = self::TABLE . '.' . self::COL_NAME,
		  TCOL_RELEASED = self::TABLE . '.' . self::COL_RELEASED,
		  TCOL_GENRE_ID = self::TABLE . '.' . self::COL_GENRE_ID,
		  TCOL_CREATED_AT = self::TABLE . '.' . self::COL_CREATED_AT,
		  TCOL_UPDATED_AT = self::TABLE . '.' . self::COL_UPDATED_AT;


    const REL_MEDIA = 'media',
		  REL_GENRE = 'genre';

    protected $table = self::TABLE;
    
    protected $fillable = [
		self::COL_NAME,
		self::COL_RELEASED,
		self::COL_GENRE_ID,
	];

    protected $casts = [
		self::COL_RELEASED => self::CAST_DATE,
	];

    public static $modelRelations = [
		  self::REL_MEDIA,
		  self::REL_GENRE,
	];

    protected $fields = [
		self::COL_ID,
		self::COL_NAME,
		self::COL_RELEASED,
		self::COL_GENRE_ID,
		self::COL_CREATED_AT,
		self::COL_UPDATED_AT,
	];

    	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function media()
	{
		return $this->hasMany(Medium::class);
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function genre()
	{
		return $this->belongsTo(Genre::class, self::COL_GENRE_ID);
	}


}
