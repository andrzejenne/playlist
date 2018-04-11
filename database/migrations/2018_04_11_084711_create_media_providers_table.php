<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMediaProvidersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('media_providers', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('slug');
        });

        Schema::table('media', function (Blueprint $table) {
            $table->unsignedInteger('provider_id');
            $table->foreign('provider_id', 'fk_media_media_provider')
                ->references('id')
                ->on('media_providers')
                ->onDelete('restrict');
            $table->string('provider_sid');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('media', function(Blueprint $table) {
            $table->dropForeign('fk_media_media_provider');
            $table->dropColumn('provider_id');
            $table->dropColumn('provider_sid');
        });
        Schema::dropIfExists('media_providers');
    }
}
