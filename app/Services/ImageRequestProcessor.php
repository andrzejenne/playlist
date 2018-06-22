<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 30.5.18
 * Time: 10:22
 */

namespace BBIT\Playlist\Services;

use Illuminate\Http\Request;
use Intervention\Image\ImageManager;

/**
 * Class ImageRequestProcessor
 * @package BBIT\Playlist\Services
 */
class ImageRequestProcessor
{
    /**
     * @var ImageManager
     */
    private $imageManager;

    /**
     * ImageRequestProcessor constructor.
     * @param ImageManager $imageManager
     */
    public function __construct(ImageManager $imageManager)
    {
        $this->imageManager = $imageManager;
    }

    /**
     * @param string $path
     * @param Request $request
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     * @todo - refactor, optimize, now bad coding
     */
    public function process(string $path, Request $request)
    {
        $image = $this->imageManager->make($path);

        $args = [];
        $suffix = [];

        foreach ($request->all() as $key => $value) {
            switch ($key) {
                case 'fit':
                    $args[$key] = $value;
                    $suffix[] = $key . '-' . $value;
                    break;
            }
        }

        if (count($args)) {

            $pathInfo = pathinfo($path);

            $newFileName = $pathInfo['filename']
                . '.' . implode('.', $suffix) . '.'
                . $pathInfo['extension'];

            $md5source = $pathInfo['dirname']
                . DIRECTORY_SEPARATOR
                . $newFileName;

            $md5 = md5($md5source);

            $outPath = storage_path('cache/image')
                . DIRECTORY_SEPARATOR . $md5[0] . $md5[1] . DIRECTORY_SEPARATOR . $md5[2] . $md5[3]
                . DIRECTORY_SEPARATOR . $newFileName;

            if (!\File::exists($outPath)) {
                foreach ($args as $type => $value) {
                    switch ($type) {
                        // @todo - to methods
                        case 'fit':
                            $matches = [];
                            if (preg_match('/(\d+)x(\d+)(?:-(\w+))?/', $value, $matches)) {
                                $w = $matches[1];
                                $h = $matches[2];
                                $pos = getValue($matches[3], 'center');

                                $image->fit($w, $h, null, $pos);
                                $suffix[] = $value;
                            }
                            break;
                    }
                }

                $dir = \File::dirname($outPath);
                if (!\File::exists($dir)) {
                    \File::makeDirectory($dir, 0755, true);
                }

                $image->save($outPath);
            }

        } else {
            $outPath = $path;
        }

        return response(\File::get($outPath), 200, $this->getHeadersForPath($outPath));
    }

    /**
     * @param string $path
     * @return array
     */
    private function getHeadersForPath(string $path)
    {
        return [
            'Content-Type' => \File::mimeType($path),
            'Content-Length' => \File::size($path),
            'Cache-Control' => 'max-age=30758400, public'
        ];
    }
}