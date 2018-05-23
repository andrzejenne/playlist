<?php

namespace BBIT\Playlist\Http\Controllers;

/**
 * Class PlaylistController
 * @package BBIT\Playlist\Http\Controllers
 */
class PlaylistController extends Controller
{
    const RELEASE_REGEX = '/([\w\-]+)-(\d+\.\d+\.\d+-?\w*)\.(\w+)\.apk/';
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $files = \File::allFiles(storage_path('app/release'));

        $releases = [];
        foreach ($files as $release) {
            if (preg_match(static::RELEASE_REGEX, $release->getFilename(), $matches)){
                $releases[$matches[3]][$matches[1]][] = [$release->getCTime(), $matches[2], $matches[0]];
            }
        }

        foreach ($releases as &$release) {
            foreach ($release as &$apps) {
                usort($apps, function($a, $b) {
                    return $a[0] > $b[0] ? 1 : ($a[0] < $b[0] ? -1 : 0);
                });
            }
        }

        return view('playlist-welcome', $releases);
    }
}
