<?php

use BBIT\Playlist\Models\MediaProvider;
use Illuminate\Database\Seeder;

/**
 * Class MediaProvidersSeeder
 */
class MediaProvidersSeeder extends Seeder
{
    private $providers = [
        'youtube' => 'YouTube'
    ];
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        foreach ($this->providers as $slug => $name) {
            $record = MediaProvider::getBySlug($slug);
            if (!$record) {
                factory(MediaProvider::class)->create(['slug' => $slug, 'name' => $name]);
            }
        }
    }
}
