<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSearch extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('searches', function(Blueprint $table){
            $table->increments('id');
            $table->string('query')->index();
            $table->integer('user_id')->unsigned();

            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('media_search', function(Blueprint $table){
            $table->integer('media_id')->unsigned();
            $table->integer('search_id')->unsigned();

            $table->foreign('media_id')
                ->references('id')->on('media')->onDelete('cascade');
            $table->foreign('search_id')
                ->references('id')->on('searches')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('media_search');
        Schema::dropIfExists('searches');
    }
}
