<?php

namespace BBIT\Playlist\Console\Commands;

use BBIT\Playlist\Helpers\Str;
use BBIT\Playlist\Models\Album;
use BBIT\Playlist\Models\Artist;
use BBIT\Playlist\Models\Genre;
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\MediaFileType;
use BBIT\Playlist\Models\MediaProvider;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Providers\MediaLibraryProvider;
use BBIT\Playlist\Services\MediaProviders\OwnLibraryService;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RecursiveRegexIterator;
use RegexIterator;
use getID3;
use getid3_lib;
use Symfony\Component\Console\Style\SymfonyStyle;

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

    /** @var Collection|Album[] */
    private $albums;
    /** @var Collection|Artist[] */
    private $artists;
    /** @var Collection|Genre[] */
    private $genres;

    /** @var OwnLibraryService */
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
     * @var Collection|Medium[]
     */
    private $media;

    /**
     * @var MediaFileType[];
     */
    private $mediaFileType;

    /**
     * Create a new command instance.
     *
     * @param MediaLibraryProvider $libraryProvider
     */
    public function __construct(MediaLibraryProvider $libraryProvider)
    {
        parent::__construct();
        $this->libraryProvider = $libraryProvider;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     * @throws \getid3_exception
     */
    public function handle()
    {
        $ui = new SymfonyStyle($this->input, $this->output);

        $this->info('Preparing');

        $this->provider = $this->libraryProvider->getService('library');

        if (!$this->provider) {
            $this->error('Provider `library` not found');

            return;
        }

        $this->providerEntity = MediaProvider::whereSlug($this->provider->getName())->first();

        if (!$this->provider) {
            $this->error('ProviderEntity `library` not found');

            return;
        }

        $path = config('media.library.path');
        if (!$path) {
            $this->error('media library path not specified');

            return;
        } else {
            $path = explode(':', $path);
        }

        $ext = explode(',', config('media.library.ext'));
        $list = [];

        $this->info('Searching for files');

        foreach ($path as $dir) {
            $list = array_merge($list, $this->getMediaInPath($dir, $ext));
        }

        $id3 = new getID3();

        $this->albums = Album::all()->mapWithKeys(function (Album $album) {
            return [Str::lower($album->name) => $album];
        });
        $this->artists = Artist::all()->mapWithKeys(function (Artist $artist) {
            return [Str::lower($artist->name) => $artist];
        });
        $this->genres = Genre::all()->mapWithKeys(function (Genre $genre) {
            return [Str::lower($genre->name) => $genre];
        });

        $this->media = Medium::whereProviderId($this->providerEntity->id)
            ->get()
            ->mapWithKeys(function (Medium $medium) {
                return [$medium->provider_sid => $medium];
            });


        $ui->progressStart(count($list));
        foreach ($list as $file) {
            $this->identifyMedia($file, $id3);
            $ui->progressAdvance();
        }
        $ui->progressFinish();

        $this->info('Finished');

    }

    /**
     * @param $path
     * @param $ext
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
     * @param $file
     * @param getID3 $id3
     */
    private function identifyMedia($file, getID3 $id3)
    {
        $analyze = $id3->analyze($file[1]);

        getid3_lib::CopyTagsToComments($analyze);

        $name = static::getID3String('title', $analyze);
        $artist = static::getID3String('artist', $analyze);
        $album = static::getID3String('album', $analyze);
        $year = static::getID3String('year', $analyze);
        $genre = static::getID3String('genre', $analyze);
        $track = static::getID3String('track', $analyze);

        $filename = $analyze['filename'];
        if (!$name) {
            $name = $filename;
        }
        $filePath = $analyze['filepath'];
        $dirInLib = Str::substr($filePath, Str::length($file[0]) + 1);
        $pathInLib = $dirInLib . DIRECTORY_SEPARATOR . $filename;

        if (isset($analyze['comments']['picture'])) {
            $thumbnail = reset($analyze['comments']['picture']);
        } else {
            $thumbnail = null;
        }

        if ($genre) {
            $lGenre = mb_strtolower($genre);
            $genreEntity = $this->genres->get($lGenre);
            if (!$genreEntity) {
                $genreEntity = new Genre([
                    'name' => $genre
                ]);
                $genreEntity->save();
                $this->genres[$lGenre] = $genreEntity;
            }
        } else {
            $genreEntity = null;
        }

        if ($artist) {
            $lArtist = mb_strtolower($artist);
            $artistEntity = $this->artists->get($lArtist);
            if (!$artistEntity) {
                $artistEntity = new Artist([
                    'name' => $artist
                ]);
                $artistEntity->save();
                $this->artists[$lArtist] = $artistEntity;
            }
        } else {
            $artistEntity = null;
        }

        if ($album) {
            $lAlbum = mb_strtolower($album);
            $albumEntity = $this->albums->get($lAlbum);
            if (!$albumEntity) {
                $albumEntity = new Album([
                    'name' => $album,
                    'year' => $year ? $year : null,
                ]);
                if ($genreEntity) {
                    $albumEntity->genre()->associate($genreEntity);
                }

                $albumEntity->save();

                $this->albums[$lAlbum] = $albumEntity;
            }
        } else {
            $albumEntity = null;
        }

        if ($thumbnail) {
            // @todo - cover type
            $outDir = $analyze['filepath'];
            $ext = static::getExtFromMime($thumbnail['image_mime']);
            if ($ext) {
                $coverFilename = 'cover.' . $ext;
                $thumbPath = $outDir . DIRECTORY_SEPARATOR . $coverFilename;
                $thumbInLib = $dirInLib . DIRECTORY_SEPARATOR . $coverFilename;
                if (!\File::exists($thumbPath)) {
                    \File::put($thumbPath, $thumbnail['data']);
                }
            }
        }

        $sid = $this->provider->genSid($pathInLib, $file[0], $dirInLib);

        $medium = $this->media->get($sid);
        if (!$medium) {
            $medium = new Medium([
                'name' => $name,
                'released' => null, // @todo - exact date of release ? or refactor to int just year,
                'provider_sid' => $sid
            ]);
            $medium->provider()->associate($this->providerEntity);
        }

        if ($albumEntity) {
            $medium->album()->associate($albumEntity);
        }
        if ($artistEntity) {
            $medium->artist()->associate($artistEntity);
        }
        if ($genreEntity) {
            $medium->genre()->associate($genreEntity);
        }
        if ($track) {
            $medium->setAttribute($medium::COL_ALBUM_TRACK, $track);
        }
        $medium->save();

        /** @var Collection|MediaFile[] $files */
        $files = $medium->files;
        $file = $files->filter(function (MediaFile $file) use ($filename) {
            return $file->filename === $filename;
        })->first();

        if (!$file) {
            /** @var MediaFile $file */
            $file = $medium->files()->make([
                'filename' => $filename,
                'size' => \File::size($filePath),
            ]);
            if (!isset($analyze['mime_type'])) {
                $analyze['mime_type'] = \File::mimeType($analyze['filenamepath']);
                if (!$analyze['mime_type']) {
                    return false;
                }
            }
            $mediaFileType = $this->getMediaFileType($analyze['mime_type']);

            if ($mediaFileType) {
                $file->type()->associate($mediaFileType);
                $file->save();

                $files->push($file);
            }
            else {
                $this->warn('Invalid mime type ' . $analyze['mime_type'] . ' for ' . $analyze['filenamepath']);
            }
        }

        if (isset($thumbInLib) && isset($thumbPath) && isset($coverFilename)) {
            $thumb = $files->filter(function (MediaFile $file) {
                return $file->type->slug === 'thumbnail';
            })->first();

            if (!$thumb) {
                /** @var MediaFile $file */
                $file = $medium->files()->make([
                    'filename' => $coverFilename,
                    'size' => \File::size($thumbPath),
                ]);
                $mediaFileType = $this->getMediaFileType('thumbnail');

                $file->type()->associate($mediaFileType);
                $file->save();

                $files->push($file);
            }
        }
    }

    /**
     * @param $mime
     * @todo - repo
     * @return MediaFileType
     */
    private function getMediaFileType($mime)
    {
        switch ($mime) {
            case 'application/ogg';
                $type = 'audio';
                break;
        }

        if (!isset($type)) {
            list($type,) = explode('/', $mime);
        }

        if (!isset($this->mediaFileTypes[$type])) {
            $this->mediaFileType[$type] = MediaFileType::whereSlug($type)->first();
        }

        return $this->mediaFileType[$type];
    }

    /**
     * @param $key
     * @param $analyze
     * @return string
     */
    private static function getID3String($key, $analyze)
    {
        if (isset($analyze['comments'][$key])) {
            return trim(reset($analyze['comments'][$key]));
        }

        return null;
    }

    /**
     * @param $type
     * @return null|string
     */
    private static function getExtFromMime($type)
    {
        switch ($type) {
            case 'image/jpeg':
                return 'jpg';
            case 'image/png':
                return 'png';
        }

        return null;
    }
}
