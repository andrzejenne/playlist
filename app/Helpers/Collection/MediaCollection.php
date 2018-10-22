<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 16.5.18
 * Time: 8:23
 */

namespace BBIT\Playlist\Helpers\Collection;

use BBIT\Playlist\Models\Album;
use BBIT\Playlist\Models\Artist;
use BBIT\Playlist\Models\MediaFile;
use BBIT\Playlist\Models\MediaProvider;
use BBIT\Playlist\Models\Medium;
use Illuminate\Database\Query\Builder;

/**
 * Class MediaCollection
 * @package BBIT\Playlist\Helpers\Collection
 * @method static MediaCollection whereAlbumId($value)
 * @method static MediaCollection whereAlbumTrack($value)
 * @method static MediaCollection whereArtistId($value)
 * @method static MediaCollection whereCreatedAt($value)
 * @method static MediaCollection whereDuration($value)
 * @method static MediaCollection whereGenreId($value)
 * @method static MediaCollection whereId($value)
 * @method static MediaCollection whereName($value)
 * @method static MediaCollection whereProviderId($value)
 * @method static MediaCollection whereProviderSid($value)
 * @method static MediaCollection whereReleased($value)
 * @method static MediaCollection whereUpdatedAt($value)
 */
class MediaCollection extends AbstractCollection
{
    /** @var string */
    private $provider;

    /**
     * MediaCollection constructor.
     * @param mixed[] $args
     */
    public function __construct(array $args)
    {
        parent::__construct($args);

        $this->provider = isset($args['pSlug']) ? $args['pSlug'] : null;
    }


    /**
     * @return $this
     * @throws \Exception
     */
    public function search()
    {
        $builder = $this->getBuilder();

        if (!empty($this->provider)) {
            $provider = MediaProvider::whereSlug($this->provider)->first();
            if ($provider) {
                $builder
                    ->where(Medium::COL_PROVIDER_ID, '=', $provider->id);
            }
        }

        if (!empty($this->search)) {
            $search = $this->search;
            $builder
                ->where(
                    function ($q) use ($search) {
                        $q->where(Medium::COL_NAME, 'like', "%$search%")
                            ->orWhereHas(Medium::REL_ALBUM, function ($query) use ($search) {
                                $query->where(Album::COL_NAME, 'like', "%$search%");
                            })->orWhereHas(Medium::REL_ARTIST, function ($query) use ($search) {
                                $query->where(Artist::COL_NAME, 'like', "%$search%");
                            });

                    });
        }

        // @todo - add search for album, artist, ...;
        // @todo - add search type

        return $this;
    }

    /**
     * @param string $sid
     * @return Medium|null
     * @throws \Exception
     */
    public function find($sid)
    {
        /** @var Medium $result */
        $result = $this->getBuilder()
            ->where(Medium::COL_PROVIDER_SID, '=', $sid)
            ->first();

        return $result;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder|Builder
     * @throws \Exception
     */
    protected function getBuilder()
    {
        if (!$this->builder) {
            $this->builder = Medium::with([
                Medium::REL_PROVIDER,
                Medium::REL_FILES . '.' . MediaFile::REL_TYPE,
                Medium::REL_ALBUM,
                Medium::REL_GENRE,
                Medium::REL_ARTIST
            ]);
        }

        return parent::getBuilder();
    }
}