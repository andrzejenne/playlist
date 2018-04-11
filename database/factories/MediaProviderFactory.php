<?php

use Faker\Generator as Faker;

$factory->define(BBIT\Playlist\Models\MediaProvider::class, function (Faker $faker) {
    return [
        'slug' => $faker->slug,
        'name' => $faker->text,
    ];
});
