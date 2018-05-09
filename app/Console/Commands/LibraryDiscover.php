<?php

namespace BBIT\Playlist\Console\Commands;

use getID3;
use getid3_lib;
use Illuminate\Console\Command;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RecursiveRegexIterator;
use RegexIterator;

/**
 * Class LibraryDiscover
 * @package BBIT\Playlist\Console\Commands
 */
class LibraryDiscover extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'discover:library';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Discovers media in library';

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
        $path = (array)config('media.library.path');
        $ext = explode(',', config('media.library.ext'));
        $list = [];

        foreach ($path as $dir) {
            $list = array_merge($list, $this->discoverMediaInPath($dir, $ext));
        }

        print_r($list);
    }

    /**
     * @param $path
     * @param $ext
     * @return array
     * @throws \getid3_exception
     */
    private function discoverMediaInPath($path, $ext)
    {
        $dir = new RecursiveDirectoryIterator($path);
        $ite = new RecursiveIteratorIterator($dir);
        $regx = new RegexIterator($ite, '/^.+\.(?:' . implode('|', $ext) . ')$/i', RecursiveRegexIterator::GET_MATCH);

        $id3 = new getID3();

        $ret = [];
        foreach ($regx as $file) {
//            echo $file->;
            if ($file && count($file)) {
                foreach ($file as $fPath) {
                    $analyze = $id3->analyze($fPath);
                    getid3_lib::CopyTagsToComments($analyze);
                }
                $ret[] = [
                    $fPath,
                    (array)$analyze
                ];
//                $ret = array_merge($ret, $file);
            }
//            $ret[] = ...$file;
        }
//        print_r($regx);

        return $ret;
    }
}
