@extends('layout')

@section('content')
    <div class="flex-center position-ref full-height">
        @if (Route::has('login'))
            <div class="top-right links">
                @auth
                    <a href="{{ url('/home') }}">Home</a>
                @else
                    <a href="{{ route('login') }}">Login</a>
                    <a href="{{ route('register') }}">Register</a>
                @endauth
            </div>
        @endif

        <div class="content">
            <div class="title m-b-md">
                The Playlist
            </div>

            <div class="release-links">
                <h2>Android</h2>

                <h3>Production Release:</h3>
                @foreach($signed as $appName => $releases)
                    <h4>{{$appName}}</h4>
                    <ul class="release-list">
                        @foreach($releases as $release)
                            <li><a href="/release/{{$release[2]}}">{{$release[1]}}</a></li>
                        @endforeach
                    </ul>
                @endforeach

                <h3>Debug Release:</h3>
                @foreach($debug as $appName => $releases)
                    <h4>{{$appName}}</h4>
                    <ul class="release-list">
                        @foreach($releases as $release)
                            <li><a href="/release/{{$release[2]}}">{{$release[1]}}</a></li>
                        @endforeach
                    </ul>
                @endforeach

            </div>
        </div>
    </div>
@endsection