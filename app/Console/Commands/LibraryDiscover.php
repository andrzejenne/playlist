<?php

namespace BBIT\Playlist\Console\Commands;

use BBIT\Playlist\Contracts\MediaProviderContract;
use BBIT\Playlist\Helpers\Str;
use BBIT\Playlist\Models\Album;
use BBIT\Playlist\Models\Artist;
use BBIT\Playlist\Models\Genre;
use BBIT\Playlist\Models\LibraryAlbum;
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\MediaFileType;
use BBIT\Playlist\Models\MediaProvider;
use BBIT\Playlist\Models\Medium;
use BBIT\Playlist\Providers\MediaLibraryProvider;
use BBIT\Playlist\Services\CoversService;
use BBIT\Playlist\Services\MediaProviders\OwnLibraryService;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
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

    /** @var EloquentCollection|Collection|Album[] */
    private $albums;
    /** @var EloquentCollection|Collection|Artist[] */
    private $artists;
    /** @var EloquentCollection|Collection|Genre[] */
    private $genres;

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
     * @var Collection|Medium[]
     */
    private $media;

    /**
     * @var MediaFileType[];
     */
    private $mediaFileType;

    /** @var CoversService */
    private $coversService;

    /**
     * Create a new command instance.
     *
     * @param MediaLibraryProvider $libraryProvider
     * @param CoversService $coversService
     */
    public function __construct(MediaLibraryProvider $libraryProvider, CoversService $coversService)
    {
        parent::__construct();
        $this->libraryProvider = $libraryProvider;
        $this->coversService = $coversService;
    }

    /**
     * Execute the console command.
     *
     * @throws \getid3_exception
     */
    public function handle()
    {
        $ui = new SymfonyStyle($this->input, $this->output);

        $this->info('Preparing');

        /** @var OwnLibraryService provider */
        $this->provider = $this->libraryProvider->getService('library');

        if (!$this->provider) {
            $this->error('Provider `library` not found');

            return;
        }

        $this->providerEntity = MediaProvider::whereSlug($this->provider->getSlug())->first();

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


        $ui->writeln('Catalogizing');

        $ui->progressStart(count($list));
        $dirs = [];
        foreach ($list as $file) {
            $dir = dirname($file[1]);
            if (!isset($dirs[$dir])) {
                $dirs[$dir] = [];
            }
            $fileData = $this->getFileData($file, $id3);
            $album = $fileData['album'];
            if (!isset($dirs[$dir][$album])) {
                $dirs[$dir][$album] = [];
            }
            $dirs[$dir][$album][] = $fileData;
            $ui->progressAdvance();
//            $this->identifyMedia($file, $id3);
        }
        $ui->progressFinish();

        $ui->writeln('Importing');

        $ui->progressStart(count($list));

        foreach ($dirs as $dir => $albums) {
            $isFolderAlbum = count($albums) > 1;
            $albumName = $isFolderAlbum ? basename($dir) : key($albums);
            foreach ($albums as $album => $filesData) {
                foreach ($filesData as $fileData) {
                    try {
                        $this->importMedia($fileData, $albumName, $isFolderAlbum);
                    } catch (\Exception $e) {
                        $ui->warning('cannot import ' . $fileData['name'] . ', ' . $e->getMessage());
                    }
                    $ui->progressAdvance();
                }
            }
        }
        $ui->progressFinish();


        $emptyAlbums = Album::has('media', '=', 0)->get();
        if (count($emptyAlbums)) {
            $ui->writeln('Cleanup');

            $ui->progressStart(count($emptyAlbums));
            /** @var Album $album */
            try {
                foreach ($emptyAlbums as $album) {
                    $album->delete();
                    $ui->progressAdvance();
                }
            } catch (\Exception $e) {
                $ui->warning('Cannot clear empty albums: ' . $e->getMessage());
            }
            $ui->progressFinish();
        }

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
     * @param getID3 $id3
     * @return array
     */
    private function getFileData($file, getID3 $id3)
    {
        $analyze = $id3->analyze($file[1]);

        getid3_lib::CopyTagsToComments($analyze);

        $name = static::getID3String('title', $analyze);
        $artist = static::getID3String('artist', $analyze);
        $album = static::getID3String('album', $analyze);
        $year = static::getID3String('year', $analyze);
        $genre = static::getID3String('genre', $analyze);
        $track = static::getID3String('track', $analyze);
        $duration = isset($analyze['playtime_seconds']) ? $analyze['playtime_seconds'] : null;

        $filename = $analyze['filename'];
        if (!$name) {
            $name = $filename;
        }
        $filePath = $analyze['filepath'];

        if (isset($analyze['comments']['picture'])) {
            $thumbnail = reset($analyze['comments']['picture']);
        } else {
            $thumbnail = null;
        }

        if (!$album) {
            $album = \File::name($analyze['filepath']);
        }

        $dirInLib = Str::substr($filePath, Str::length($file[0]) + 1);
        $pathInLib = $dirInLib . DIRECTORY_SEPARATOR . $filename;

        return [
            'name' => $name,
            'artist' => $artist,
            'album' => $album,
            'year' => $year,
            'genre' => $genre,
            'track' => $track,
            'duration' => $duration,
            'filename' => $filename,
            'filePath' => $filePath,
            'thumbnail' => $thumbnail,
            'dirInLib' => $dirInLib,
            'pathInLib' => $pathInLib,
            'file' => $file,
            'mimeType' => isset($analyze['mime_type']) ? $analyze['mime_type'] : null,
            'filenamepath' => $analyze['filenamepath']
        ];
    }

    /**
     * @param mixed $fileData
     * @param string $albumName
     * @param bool $isFolderAlbum
     * @throws \Exception
     */
    private function importMedia($fileData, $albumName, $isFolderAlbum = false)
    {
        $genre = $fileData['genre'];
        $artist = $fileData['artist'];
        $year = $fileData['year'];
        $pathInLib = $fileData['pathInLib'];
        $thumbnail = $fileData['thumbnail'];
        $file = $fileData['file'];
        $dirInLib = $fileData['dirInLib'];
        $duration = $fileData['duration'];
        $name = $fileData['name'];
        $track = $fileData['track'];
        $filename = $fileData['filename'];
        $filePath = $fileData['filePath'];
        $filenamepath = $fileData['filenamepath'];
        $mimeType = $fileData['mimeType'];

        if ($genre) {
            $lGenre = Str::lower($genre);
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
            $lArtist = Str::lower($artist);
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

        if ($albumName) {
            $lAlbum = Str::lower($albumName);
            $albumEntity = $this->albums->get($lAlbum);
            if (!$albumEntity) {
                $albumEntity = new Album([
                    'name' => $albumName,
                    'year' => $year && !$isFolderAlbum ? $year : null,
                ]);

                $this->albums[$lAlbum] = $albumEntity;
            }

            if (!$isFolderAlbum) {
                if ($genreEntity) {
                    $albumEntity->genre()->associate($genreEntity);
                }
                if ($artistEntity) {
                    $albumEntity->artist()->associate($artistEntity);
                }
            }
            $albumEntity->save();

        } else {
            $albumEntity = null;
        }

        if ($thumbnail) {
            // @todo - cover type
//            $outDir = $analyze['filepath'];
            $ext = static::getExtFromMime($thumbnail['image_mime']);
            if ($ext) {
//                $coverFilename = 'cover.' . $ext;
//                $thumbPath = $outDir . DIRECTORY_SEPARATOR . $coverFilename;
//                $thumbInLib = $dirInLib . DIRECTORY_SEPARATOR . $coverFilename;
//                if (!\File::exists($thumbPath)) {
//                    \File::put($thumbPath, $thumbnail['data']);
//                }

                $this->coversService->setCover($albumEntity, $thumbnail['data'], 'front', $ext);
            }
        }

        $sid = $this->provider->genSid($pathInLib, $file[0]); //, $dirInLib);
        if ($albumEntity) {
            $paths = $albumEntity->libraries()->get();

            $libSid = Str::substr($sid, 6, 6);

            $libraryAlbum = $paths->filter(function (LibraryAlbum $libraryAlbum) use ($libSid, $dirInLib) {
                return $libraryAlbum->sid == $libSid && $libraryAlbum->path == $dirInLib;
            })->first();

            if (!$libraryAlbum) {
                $albumEntity->libraries()->create([
                    LibraryAlbum::COL_SID => $libSid,
                    LibraryAlbum::COL_PATH => $dirInLib
                ]);
            }
        }

        $medium = $this->media->get($sid);
        if (!$medium) {
            $medium = new Medium([
                Medium::COL_NAME => $name,
                Medium::COL_DURATION => $duration,
                Medium::COL_RELEASED => null, // @todo - exact date of release ? or refactor to int just year,
                Medium::COL_PROVIDER_SID => $sid
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
            if (!$mimeType) {
                $mimeType = \File::mimeType($filenamepath);
                if (!$mimeType) {
                    return false;
                }
            }
            $mediaFileType = $this->getMediaFileType($mimeType);

            if ($mediaFileType) {
                $file->type()->associate($mediaFileType);
                $file->save();

                $files->push($file);
            } else {
                $this->warn('Invalid mime type ' . $mimeType . ' for ' . $filenamepath);
            }
        }

//        if (isset($thumbInLib) && isset($thumbPath) && isset($coverFilename)) {
//            $thumb = $files->filter(function (MediaFile $file) {
//                return $file->type->slug === 'thumbnail';
//            })->first();
//
//            if (!$thumb) {
//                /** @var MediaFile $file */
//                $file = $medium->files()->make([
//                    'filename' => $coverFilename,
//                    'size' => \File::size($thumbPath),
//                ]);
//                $mediaFileType = $this->getMediaFileType('thumbnail');
//
//                $file->type()->associate($mediaFileType);
//                $file->save();
//
//                $files->push($file);
//            }
//        }
    }

    /**
     * @param string $mime
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

        if (!isset($this->mediaFileType[$type])) {
            $this->mediaFileType[$type] = MediaFileType::whereSlug($type)->first();
        }

        return $this->mediaFileType[$type];
    }

    /**
     * @param string $key
     * @param mixed $analyze
     * @return string|null
     */
    private static function getID3String($key, $analyze)
    {
        if (isset($analyze['comments'][$key])) {
            return trim(reset($analyze['comments'][$key]));
        }

        return null;
    }

    /**
     * @param string $type
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
