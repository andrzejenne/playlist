<?php

namespace BBIT\Playlist\Models;

use Illuminate\Database\Eloquent\Builder;

/**
 * Class Search
 *
 * @package BBIT\Playlist\Models
 * @property int $id
 * @property string $query
 * @property int $user_id
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection|\BBIT\Playlist\Models\Medium[] $media
 * @property-read \BBIT\Playlist\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Search whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Search whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Search whereQuery($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Search whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\Search whereUserId($value)
 * @mixin \Eloquent
 */
class Search extends BaseModel
{

    const TABLE = 'searches';

    const COL_ID = 'id',
        COL_QUERY = 'query',
        COL_USER_ID = 'user_id',
        COL_CREATED_AT = 'created_at',
        COL_UPDATED_AT = 'updated_at';

    const TCOL_ID = self::TABLE . '.' . self::COL_ID,
        TCOL_QUERY = self::TABLE . '.' . self::COL_QUERY,
        TCOL_USER_ID = self::TABLE . '.' . self::COL_USER_ID,
        TCOL_CREATED_AT = self::TABLE . '.' . self::COL_CREATED_AT,
        TCOL_UPDATED_AT = self::TABLE . '.' . self::COL_UPDATED_AT;


    const REL_MEDIA = 'media',
        REL_USER = 'user';

    protected $table = self::TABLE;

    protected $fillable = [
        self::COL_QUERY,
        self::COL_USER_ID,
    ];

    protected $casts = [
    ];

    public static $modelRelations = [
        self::REL_MEDIA,
        self::REL_USER,
    ];

    protected $fields = [
        self::COL_ID,
        self::COL_QUERY,
        self::COL_USER_ID,
        self::COL_CREATED_AT,
        self::COL_UPDATED_AT,
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function media()
    {
        return $this->belongsToMany(Medium::class, 'media_search');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class, self::COL_USER_ID);
    }


}
