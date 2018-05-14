<?php

use BBIT\Playlist\Models\CoverType;
use Illuminate\Database\Seeder;

/**
 * Class CoverTypesSeeder
 */
class CoverTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $front = CoverType::whereSlug('front')->first();
        if (!$front){
            $front = new CoverType([
                CoverType::COL_SLUG => 'front'
            ]);
            $front->save();
        }
    }
}
