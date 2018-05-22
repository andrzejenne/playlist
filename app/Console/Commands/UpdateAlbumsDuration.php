<?php

namespace BBIT\Playlist\Console\Commands;

use BBIT\Playlist\Models\Album;
use BBIT\Playlist\Models\Medium;
use Illuminate\Console\Command;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Class UpdateAlbumsDuration
 * @package BBIT\Playlist\Console\Commands
 */
class UpdateAlbumsDuration extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'discover:library:duration';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sums durations for albums';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $ui = new SymfonyStyle($this->input, $this->output);

        $albums = Album::all();

        $ui->progressStart($albums->count());
        foreach ($albums as $album) {
            $duration = 0;
            $album->media->each(function(Medium $medium) use (&$duration){
                $duration += $medium->duration;
            });
            $album->duration = $duration;
            $album->save();
            $ui->progressAdvance();
        }
        $ui->progressFinish();

        $this->info('Finished');
    }

}
