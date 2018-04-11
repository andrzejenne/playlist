<?php

use Faker\Generator as Faker;

$factory->define(BBIT\Playlist\Models\MediaFileType::class, function (Faker $faker) {
    return [
        'slug' => $faker->slug
    ];
});
