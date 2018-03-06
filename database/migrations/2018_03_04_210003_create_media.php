<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMedia extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('media_types', function(Blueprint $table){
            $table->increments('id');
            $table->string('name')->unique();
            $table->string('slug')->unique();
        });

        Schema::create('genres', function(Blueprint $table) {
            $table->increments('id');
            $table->string('name')->unique();
        });

        Schema::create('artists', function(Blueprint $table){
            $table->increments('id');
            $table->string('name')->index();

            $table->timestamps();
        });

        Schema::create('albums', function(Blueprint $table){
            $table->increments('id');
            $table->string('name')->index();
            $table->date('released')->nullable();
            $table->integer('genre_id')->unsigned();

            $table->foreign('genre_id')->references('id')->on('genres')
                ->onDelete('cascade');

            $table->timestamps();
        });

        Schema::create('media', function(Blueprint $table){
            $table->increments('id');
            $table->string('name')->index();
            $table->integer('artist_id')->unsigned()->nullable();
            $table->integer('album_id')->unsigned()->nullable();
            $table->integer('genre_id')->unsigned()->nullable();
            $table->date('released')->nullable();

            $table->foreign('artist_id')
                ->references('id')->on('artists')->onDelete('cascade');
            $table->foreign('album_id')
                ->references('id')->on('albums')->onDelete('cascade');
            $table->foreign('genre_id')
                ->references('id')->on('genres')->onDelete('cascade');

            $table->timestamps();

        });

        Schema::create('media_playlist', function(Blueprint $table) {
            $table->integer('media_id')->unsigned();
            $table->integer('playlist_id')->unsigned();

            $table->foreign('media_id')->references('id')
                ->on('media')->onDelete('cascade');
            $table->foreign('playlist_id')->references('id')
                ->on('playlists')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('media_playlist');
        Schema::drop('media');
        Schema::drop('artists');
        Schema::drop('albums');
        Schema::drop('genres');
        Schema::drop('media_types');
    }
}
