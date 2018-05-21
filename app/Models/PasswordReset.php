<?php

namespace BBIT\Playlist\Models;

/**
 * Class PasswordReset
 * @package BBIT\Playlist\Models
 */
class PasswordReset extends BaseModel
{

    const TABLE = 'password_resets';

    const COL_EMAIL = 'email',
        COL_TOKEN = 'token',
        COL_CREATED_AT = 'created_at';

    const TCOL_EMAIL = self::TABLE . '.' . self::COL_EMAIL,
        TCOL_TOKEN = self::TABLE . '.' . self::COL_TOKEN,
        TCOL_CREATED_AT = self::TABLE . '.' . self::COL_CREATED_AT;


    protected $table = self::TABLE;

    protected $fillable = [
        self::COL_EMAIL,
        self::COL_TOKEN,
    ];

    protected $casts = [
    ];


    protected $fields = [
        self::COL_EMAIL,
        self::COL_TOKEN,
        self::COL_CREATED_AT,
    ];


}
