<?php
/**
 * Created by PhpStorm.
 * User: andrzej
 * Date: 28.4.18
 * Time: 1:43
 */

namespace BBIT\Playlist\Http\Controllers\API;


use BBIT\Playlist\Models\User;
use Illuminate\Http\Request;

/**
 * Class UsersController
 * @package BBIT\Playlist\Http\Controllers\API
 */
class UsersController
{
    /**
     * @param User $user
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|string
     */
    public function getByEmail(User $user, Request $request) {
//        $user = $request->user();
//        if ($user) {
//            return response()->json($user);
//        }

//    die($request->get('value'));
        $email = trim($request->get('value'));

        try {
            $record = User::whereEmail($email)->first();
            if ($record) {
                return response()->json($record);
            }
        }
        catch (\Exception $e) {
            return json_encode(['message' => $e->getMessage()]);
        }
//        finally {
//            return '{}';
//        }
//        return '<|>';
    }

}