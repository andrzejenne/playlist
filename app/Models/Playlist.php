<?php

namespace BBIT\Playlist\Models;

/**
 * Class Playlist
 * @package BBIT\Playlist\Models
 */
class Playlist extends BaseModel
{
    
    const TABLE = 'playlists';

    const COL_ID = 'id',
		  COL_USER_ID = 'user_id',
		  COL_NAME = 'name',
		  COL_DESCRIPTION = 'description',
		  COL_CREATED_AT = 'created_at',
		  COL_UPDATED_AT = 'updated_at';

	const TCOL_ID = self::TABLE . '.' . self::COL_ID,
		  TCOL_USER_ID = self::TABLE . '.' . self::COL_USER_ID,
		  TCOL_NAME = self::TABLE . '.' . self::COL_NAME,
		  TCOL_DESCRIPTION = self::TABLE . '.' . self::COL_DESCRIPTION,
		  TCOL_CREATED_AT = self::TABLE . '.' . self::COL_CREATED_AT,
		  TCOL_UPDATED_AT = self::TABLE . '.' . self::COL_UPDATED_AT;


    const REL_MEDIA = 'media',
		  REL_USER = 'user';

    protected $table = self::TABLE;
    
    protected $fillable = [
		self::COL_USER_ID,
		self::COL_NAME,
		self::COL_DESCRIPTION,
	];

    protected $casts = [
	];

    public static $modelRelations = [
		  self::REL_MEDIA,
		  self::REL_USER,
	];

    protected $fields = [
		self::COL_ID,
		self::COL_USER_ID,
		self::COL_NAME,
		self::COL_DESCRIPTION,
		self::COL_CREATED_AT,
		self::COL_UPDATED_AT,
	];

    	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
	 */
	public function media()
	{
		return $this->belongsToMany(Medium::class, 'media_playlist');
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function user()
	{
		return $this->belongsTo(User::class, self::COL_USER_ID);
	}


}
