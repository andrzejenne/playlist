<?php

use BBIT\Playlist\Models\MediaProvider;
use Illuminate\Database\Seeder;

/**
 * Class MediaProvidersSeeder
 */
class MediaProvidersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        foreach (config('media.providers') as $name => $concrete) {
            $slug = \BBIT\Playlist\Helpers\Str::slug($name);
            $record = MediaProvider::getBySlug($slug);
            if (!$record) {
                factory(MediaProvider::class)->create(['slug' => $slug, 'name' => $name]);
            }
        }
    }
}
