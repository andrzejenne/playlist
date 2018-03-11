<?php

namespace BBIT\Playlist\Models;

/**
 * Class Genre
 * @package BBIT\Playlist\Models
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


}
