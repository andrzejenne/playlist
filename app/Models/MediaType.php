<?php

namespace BBIT\Playlist\Models;

/**
 * Class MediaType
 * @package BBIT\Playlist\Models
 */
class MediaType extends BaseModel
{
    
    const TABLE = 'media_types';

    const COL_ID = 'id',
		  COL_NAME = 'name',
		  COL_SLUG = 'slug';

	const TCOL_ID = self::TABLE . '.' . self::COL_ID,
		  TCOL_NAME = self::TABLE . '.' . self::COL_NAME,
		  TCOL_SLUG = self::TABLE . '.' . self::COL_SLUG;


    

    protected $table = self::TABLE;
    
    protected $fillable = [
		self::COL_NAME,
		self::COL_SLUG,
	];

    protected $casts = [
	];

    

    protected $fields = [
		self::COL_ID,
		self::COL_NAME,
		self::COL_SLUG,
	];

    
}
