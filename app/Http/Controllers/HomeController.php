<?php

namespace BBIT\Playlist\Http\Controllers;

use Illuminate\View\View;

/**
 * Class HomeController
 * @package BBIT\Playlist\Http\Controllers
 */
class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return View
     */
    public function index()
    {
//        $redirectTo = config('auth.redirectTo');
//        return response()->redirectTo($redirectTo);

        return view('home');
    }
}
