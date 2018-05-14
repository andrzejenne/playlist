<?php

use Illuminate\Database\Seeder;

/**
 * Class DatabaseSeeder
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->call(UsersTableSeeder::class);
        $this->call(MediaTypesSeeder::class);
        $this->call(MediaFileTypesSeeder::class);
        $this->call(MediaProvidersSeeder::class);
        $this->call(CoverTypesSeeder::class);
    }
}
