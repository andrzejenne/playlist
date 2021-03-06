<?php

namespace BBIT\Playlist\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Laravel\Passport\AuthCode;
use Laravel\Passport\Client;
use Laravel\Passport\Token;
use Laravel\Socialite\Contracts\Provider;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;

/**
 * Class User
 *
 * @package BBIT\Playlist\Models
 * @method getEmail()
 * @method getName()
 * @method getAvatar()
 * @property string $name
 * @property string $avatar
 * @property string $email
 * @property string $token
 * @property int $id
 * @property string $password
 * @property string|null $provider
 * @property string|null $provider_id
 * @property string|null $access_token
 * @property string|null $remember_token
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection|\Laravel\Passport\Token[] $oauthAccessTokens
 * @property-read \Illuminate\Database\Eloquent\Collection|\Laravel\Passport\AuthCode[] $oauthAuthCodes
 * @property-read \Illuminate\Database\Eloquent\Collection|\Laravel\Passport\Client[] $oauthClients
 * @property-read \Illuminate\Database\Eloquent\Collection|\BBIT\Playlist\Models\Playlist[] $playlists
 * @property-read \Illuminate\Database\Eloquent\Collection|\BBIT\Playlist\Models\Search[] $searches
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\User whereAccessToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\User whereAvatar($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\User whereProvider($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\User whereProviderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\BBIT\Playlist\Models\User whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class User extends BaseModel implements
    AuthenticatableContract,
    AuthorizableContract,
    CanResetPasswordContract
{
    use Authenticatable, Authorizable, CanResetPassword;

    const TABLE = 'users';

    const COL_ID = 'id',
        COL_NAME = 'name',
        COL_EMAIL = 'email',
        COL_PASSWORD = 'password',
        COL_AVATAR = 'avatar',
        COL_PROVIDER = 'provider',
        COL_PROVIDER_ID = 'provider_id',
        COL_ACCESS_TOKEN = 'access_token',
        COL_REMEMBER_TOKEN = 'remember_token',
        COL_CREATED_AT = 'created_at',
        COL_UPDATED_AT = 'updated_at';

    const TCOL_ID = self::TABLE . '.' . self::COL_ID,
        TCOL_NAME = self::TABLE . '.' . self::COL_NAME,
        TCOL_EMAIL = self::TABLE . '.' . self::COL_EMAIL,
        TCOL_PASSWORD = self::TABLE . '.' . self::COL_PASSWORD,
        TCOL_AVATAR = self::TABLE . '.' . self::COL_AVATAR,
        TCOL_PROVIDER = self::TABLE . '.' . self::COL_PROVIDER,
        TCOL_PROVIDER_ID = self::TABLE . '.' . self::COL_PROVIDER_ID,
        TCOL_ACCESS_TOKEN = self::TABLE . '.' . self::COL_ACCESS_TOKEN,
        TCOL_REMEMBER_TOKEN = self::TABLE . '.' . self::COL_REMEMBER_TOKEN,
        TCOL_CREATED_AT = self::TABLE . '.' . self::COL_CREATED_AT,
        TCOL_UPDATED_AT = self::TABLE . '.' . self::COL_UPDATED_AT;


    const REL_OAUTH_ACCESS_TOKENS = 'oauthAccessTokens',
        REL_OAUTH_AUTH_CODES = 'oauthAuthCodes',
        REL_OAUTH_CLIENTS = 'oauthClients',
        REL_PLAYLISTS = 'playlists',
        REL_SEARCHES = 'searches',
        REL_PROVIDER = 'provider';

    protected $table = self::TABLE;

    protected $fillable = [
        self::COL_NAME,
        self::COL_EMAIL,
        self::COL_PASSWORD,
        self::COL_AVATAR,
        self::COL_PROVIDER,
        self::COL_PROVIDER_ID,
        self::COL_ACCESS_TOKEN,
        self::COL_REMEMBER_TOKEN,
    ];

    protected $casts = [
    ];

    public static $modelRelations = [
        self::REL_OAUTH_ACCESS_TOKENS,
        self::REL_OAUTH_AUTH_CODES,
        self::REL_OAUTH_CLIENTS,
        self::REL_PLAYLISTS,
        self::REL_SEARCHES,
        self::REL_PROVIDER,
    ];

    protected $fields = [
        self::COL_ID,
        self::COL_NAME,
        self::COL_EMAIL,
        self::COL_PASSWORD,
        self::COL_AVATAR,
        self::COL_PROVIDER,
        self::COL_PROVIDER_ID,
        self::COL_ACCESS_TOKEN,
        self::COL_REMEMBER_TOKEN,
        self::COL_CREATED_AT,
        self::COL_UPDATED_AT,
    ];

    protected $hidden = [
        self::COL_PASSWORD,
        self::COL_ACCESS_TOKEN,
        self::COL_REMEMBER_TOKEN
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function oauthAccessTokens()
    {
        return $this->hasMany(Token::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function oauthAuthCodes()
    {
        return $this->hasMany(AuthCode::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function oauthClients()
    {
        return $this->hasMany(Client::class);
    }

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

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function provider()
    {
        return $this->belongsTo(Provider::class, self::COL_PROVIDER_ID);
    }


}
