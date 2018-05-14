<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCoversTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cover_types', function(Blueprint $table){
            $table->increments('id');
            $table->string('slug');
        });

        Schema::create('covers', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('album_id')->unsigned();
            $table->integer('cover_type_id')->unsigned();

            $table->foreign('album_id')->references('id')->on('albums')
                ->onDelete('cascade');

            $table->foreign('cover_type_id')->references('id')->on('cover_types')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('covers');
        Schema::dropIfExists('cover_types');
    }
}
