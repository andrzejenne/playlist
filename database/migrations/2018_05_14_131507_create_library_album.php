<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateLibraryAlbum extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('library_albums', function (Blueprint $table) {
            $table->increments('id');
            $table->string('sid', 6); // library string id (md5 length: 6)
            $table->string('path');
            $table->integer('album_id')->unsigned()->nullable();
            $table->foreign('album_id')->references('id')->on('albums')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('library_albums');
    }
}
