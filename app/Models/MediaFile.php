<?php

namespace BBIT\Playlist\Models;

/**
 * Class MediaFile
 * @package BBIT\Playlist\Models
 */
class MediaFile extends BaseModel
{
    
    const TABLE = 'media_files';

    const COL_ID = 'id',
		  COL_MEDIA_ID = 'media_id',
		  COL_TYPE_ID = 'type_id',
		  COL_FILENAME = 'filename',
		  COL_SIZE = 'size',
		  COL_CREATED_AT = 'created_at',
		  COL_UPDATED_AT = 'updated_at';

	const TCOL_ID = self::TABLE . '.' . self::COL_ID,
		  TCOL_MEDIA_ID = self::TABLE . '.' . self::COL_MEDIA_ID,
		  TCOL_TYPE_ID = self::TABLE . '.' . self::COL_TYPE_ID,
		  TCOL_FILENAME = self::TABLE . '.' . self::COL_FILENAME,
		  TCOL_SIZE = self::TABLE . '.' . self::COL_SIZE,
		  TCOL_CREATED_AT = self::TABLE . '.' . self::COL_CREATED_AT,
		  TCOL_UPDATED_AT = self::TABLE . '.' . self::COL_UPDATED_AT;


    const REL_MEDIA = 'media',
		  REL_TYPE = 'type';

    protected $table = self::TABLE;
    
    protected $fillable = [
		self::COL_MEDIA_ID,
		self::COL_TYPE_ID,
		self::COL_FILENAME,
		self::COL_SIZE,
	];

    protected $casts = [
		self::COL_SIZE => self::CAST_INTEGER,
	];

    public static $modelRelations = [
		  self::REL_MEDIA,
		  self::REL_TYPE,
	];

    protected $fields = [
		self::COL_ID,
		self::COL_MEDIA_ID,
		self::COL_TYPE_ID,
		self::COL_FILENAME,
		self::COL_SIZE,
		self::COL_CREATED_AT,
		self::COL_UPDATED_AT,
	];

    	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function media()
	{
		return $this->belongsTo(Medium::class, self::COL_MEDIA_ID);
	}

	/**
	 * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
	 */
	public function type()
	{
		return $this->belongsTo(MediaFileType::class, self::COL_TYPE_ID);
	}


}
