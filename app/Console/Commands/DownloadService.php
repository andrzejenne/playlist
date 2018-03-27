<?php

namespace BBIT\Playlist\Console\Commands;

use Illuminate\Console\Command;

class DownloadService extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'service:download {sid}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Download service';

    public static $possibleAudios = [
        'm4a'
    ];

    public static $possibleVideos = [
        'mp4'
    ];

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $info = InfoController::getInfo($sid);
        if ($info) {
            $collection = collect($info['formats']);

            $videos = $collection->filter(function ($item) {
                if (in_array($item['ext'], static::$possibleVideos)) {
                    return $item;
                }

                return false;
            })->sortByDesc(function ($item) {
                return $item['width'];
            });

            $audios = $collection->filter(function ($item) {
                if (in_array($item['ext'], static::$possibleAudios)) {
                    return $item;
                }

                return false;
            })->sortByDesc(function ($item) {
                return $item['abr'];
            }, SORT_NUMERIC);

            if ($videos->count() && $audios->count()) {
                $vcode = $videos->first()['format_id'];
                $acode = $audios->first()['format_id'];
                $cmd = Process::prepare('youtube-dl')
                    ->enableErrorOutput()
                    ->enableOutput()
                    ->setWorkingDir(storage_path('temp'))
                    ->execute('-f', "$vcode+$acode", $sid);

                if ($cmd->success()) {
                    return $cmd->report();
                }
                else {
                    throw new \Exception('Error downloading: ' . $cmd->error());
                }
            }
            else {
                throw new \Exception('cannot download');
            }
        }
    }
}
