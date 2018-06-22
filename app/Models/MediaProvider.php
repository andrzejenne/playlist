<?php

namespace BBIT\Playlist\Models;

use BBIT\Playlist\Contracts\MediaProviderContract;
use BBIT\Playlist\Models\Traits\HasSlug;
use BBIT\Playlist\Providers\MediaLibraryProvider;

/**
 * Class MediaProvider
 *
 * @package BBIT\Playlist\Models
 * @property int $id
 * @property string $name
 * @property string $slug
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\MediaProvider whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\MediaProvider whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\MediaProvider whereSlug($value)
 * @mixin \Eloquent
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

    /** @var MediaLibraryProvider */
    private $_provider;

    /**
     * @return MediaProviderContract
     */
    public function getService()
    {
        return $this->getProvider()
            ->getService($this->slug);
    }

    /**
     * @return MediaLibraryProvider
     */
    private function getProvider() {
        if (!$this->_provider) {
            $this->_provider = \App::make(MediaLibraryProvider::class);
        }

        return $this->_provider;
    }

}
