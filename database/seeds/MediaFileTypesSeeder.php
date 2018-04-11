<?php

use BBIT\Playlist\Models\MediaFileType;
use Illuminate\Database\Seeder;

/**
 * Class MediaFileTypesSeeder
 */
class MediaFileTypesSeeder extends Seeder
{
    private $types = ['video', 'audio', 'thumbnail'];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        foreach ($this->types as $type) {
            $record = MediaFileType::getBySlug($type);
            if (!$record) {
                factory(MediaFileType::class)->create(['slug' => $type]);
            }
        }
    }
}
