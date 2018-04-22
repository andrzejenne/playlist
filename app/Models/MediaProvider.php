<?php

namespace BBIT\Playlist\Models;

use BBIT\Playlist\Models\Traits\HasSlug;

/**
 * Class MediaProvider
 * @package BBIT\Playlist\Models
 */
class MediaProvider extends BaseModel
{
    use HasSlug;
    
    const TABLE = 'media_providers';

    const COL_ID = 'id',
		  COL_NAME = 'name',
		  COL_SLUG = 'slug';

	const TCOL_ID = self::TABLE . '.' . self::COL_ID,
		  TCOL_NAME = self::TABLE . '.' . self::COL_NAME,
		  TCOL_SLUG = self::TABLE . '.' . self::COL_SLUG;


	public $timestamps = false;
    

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

//    public function toArray()
//    {
//        return parent::toArray() + [
//            'url' => config('app.url') . '/media/' . $this->slug
//        ];
//    }


}
