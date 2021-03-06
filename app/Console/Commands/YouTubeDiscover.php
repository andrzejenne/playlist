<?php

namespace BBIT\Playlist\Console\Commands;

use BBIT\Playlist\Contracts\MediaProviderContract;
use BBIT\Playlist\Models\MediaProvider;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Providers\MediaLibraryProvider;
use BBIT\Playlist\Services\MediaDiscoveryService;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RecursiveRegexIterator;
use RegexIterator;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Class YouTubeDiscover
 * @package BBIT\Playlist\Console\Commands
 */
class YouTubeDiscover extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'discover:youtube';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Discovers media in youtube library';

    /** @var MediaProviderContract */
    private $provider;

    /**
     * @var MediaProvider
     */
    private $providerEntity;

    /**
     * @var MediaLibraryProvider
     */
    private $libraryProvider;

    /**
     * @var EloquentCollection|Collection|Medium[]
     */
    private $media;

    /**
     * @var MediaDiscoveryService
     */
    private $discoveryService;

    /**
     * Create a new command instance.
     *
     * @param MediaLibraryProvider $libraryProvider
     * @param MediaDiscoveryService $discoveryService
     */
    public function __construct(MediaLibraryProvider $libraryProvider, MediaDiscoveryService $discoveryService)
    {
        parent::__construct();
        $this->libraryProvider = $libraryProvider;
        $this->discoveryService = $discoveryService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ui = new SymfonyStyle($this->input, $this->output);

        $this->info('Preparing');

        $this->provider = $this->libraryProvider->getService('youtube');

        if (!$this->provider) {
            $this->error('Provider `youtube` not found');

            return;
        }

        $this->providerEntity = MediaProvider::whereSlug($this->provider->getSlug())->first();

        if (!$this->provider) {
            $this->error('ProviderEntity `youtube` not found');

            return;
        }

        $ext = ['mp4', 'mp3'];

        $this->info('Searching for files');

        $list = $this->getMediaInPath($this->provider->getBasePath(), $ext);

        $this->media = Medium::whereProviderId($this->providerEntity->id)
            ->get()
            ->mapWithKeys(function (Medium $medium) {
                return [$medium->provider_sid => $medium];
            });


        $ui->progressStart(count($list));
        foreach ($list as $file) {
            $this->identifyMedia($file);
            $ui->progressAdvance();
        }
        $ui->progressFinish();

        $this->info('Finished');
    }

    /**
     * @param string $path
     * @param string[] $ext
     * @return array
     */
    private function getMediaInPath($path, $ext)
    {
        $dir = new RecursiveDirectoryIterator($path);
        $ite = new RecursiveIteratorIterator($dir);
        $regx = new RegexIterator($ite, '/^.+\.(?:' . implode('|', $ext) . ')$/i', RecursiveRegexIterator::GET_MATCH);

        $ret = [];
        foreach ($regx as $file) {
            foreach ($file as $filePath) {
                $ret[] = [$path, $filePath];
            }
        }

        return $ret;
    }

    /**
     * @param mixed $file
     */
    private function identifyMedia($file)
    {
        $sid = \File::name($file[1]);

        $info = $this->provider->info($sid);

        if ($info) {
            $this->discoveryService->discoverMedia($sid, $info->snippet->title, $this->provider, $this->providerEntity);
        }
    }

}
