<?php

use BBIT\Playlist\Models\User;
use Illuminate\Database\Seeder;

/**
 * Class UsersTableSeeder
 */
class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $root = User::whereId(1)->first();
        if (!$root) {
            $root = new User();
            $root->id = 1;
            $root->name = 'root';
            $root->email = 'andrzej.heczko@gmail.com';
            $root->password = 'test';

            $root->save();
        }
    }
}
