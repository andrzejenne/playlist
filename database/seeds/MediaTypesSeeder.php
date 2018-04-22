<?php

use BBIT\Playlist\Models\MediaType;
use Illuminate\Database\Seeder;

/**
 * Class MediaTypesSeeder
 */
class MediaTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $unknown = MediaType::whereSlug('unknown')->first();
        if (!$unknown){
            $unknown = new MediaType([
                MediaType::COL_SLUG => 'unknown',
                MediaType::COL_NAME => 'unknown'
            ]);
            $unknown->save();
        }
    }
}
