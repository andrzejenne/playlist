<?php

namespace BBIT\Playlist\Models;

/**
 * Class User
 * @package BBIT\Playlist\Models
 */
class User extends BaseModel
{
    
    const TABLE = 'users';

    const COL_ID = 'id',
		  COL_NAME = 'name',
		  COL_EMAIL = 'email',
		  COL_PASSWORD = 'password',
		  COL_REMEMBER_TOKEN = 'remember_token',
		  COL_CREATED_AT = 'created_at',
		  COL_UPDATED_AT = 'updated_at';

	const TCOL_ID = self::TABLE . '.' . self::COL_ID,
		  TCOL_NAME = self::TABLE . '.' . self::COL_NAME,
		  TCOL_EMAIL = self::TABLE . '.' . self::COL_EMAIL,
		  TCOL_PASSWORD = self::TABLE . '.' . self::COL_PASSWORD,
		  TCOL_REMEMBER_TOKEN = self::TABLE . '.' . self::COL_REMEMBER_TOKEN,
		  TCOL_CREATED_AT = self::TABLE . '.' . self::COL_CREATED_AT,
		  TCOL_UPDATED_AT = self::TABLE . '.' . self::COL_UPDATED_AT;


    const REL_PLAYLISTS = 'playlists',
		  REL_SEARCHES = 'searches';

    protected $table = self::TABLE;
    
    protected $fillable = [
		self::COL_NAME,
		self::COL_EMAIL,
		self::COL_PASSWORD,
		self::COL_REMEMBER_TOKEN,
	];

    protected $casts = [
	];

    public static $modelRelations = [
		  self::REL_PLAYLISTS,
		  self::REL_SEARCHES,
	];

    protected $fields = [
		self::COL_ID,
		self::COL_NAME,
		self::COL_EMAIL,
		self::COL_PASSWORD,
		self::COL_REMEMBER_TOKEN,
		self::COL_CREATED_AT,
		self::COL_UPDATED_AT,
	];

    	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function playlists()
	{
		return $this->hasMany(Playlist::class);
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\HasMany
	 */
	public function searches()
	{
		return $this->hasMany(Search::class);
	}


}
