import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {IonicStorageModule} from '@ionic/storage';

import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {GooglePlus} from "@ionic-native/google-plus";

import {ThePlaylist} from './app.component';
import {PlaylistsPage} from '../pages/playlists/playlists';
import {SplashPage} from "../pages/splash/splash";
import {SearchPage} from '../pages/search/search';

import {DurationPipe} from "../pipes/duration";

import {BackgroundMode} from "@ionic-native/background-mode";
import {Keyboard} from "@ionic-native/keyboard";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {Insomnia} from '@ionic-native/insomnia';

import {AuthError} from "../pages/auth/error";

import {ServicesModule} from "./services.module";
import {CloudPage} from "../pages/cloud/cloud";
import {DownloadQueueComponent} from "../components/download-queue/download-queue.component";
import {VideoPlayerComponent} from "../components/video-player/video-player.component";
import {ServerManagerComponent} from "../components/server-manager/server-manager.component";
import {SettingsPage} from "../pages/settings/settings";
import {PlaylistComboComponent} from "../components/playlists-combo/playlist-combo.component";
import {AddPlaylistComponent} from "../pages/playlists/playlist/add-playlist.component";
import {AndroidFullScreen} from '@ionic-native/android-full-screen';
import {SelectComponent} from "../components/select/select.component";
import {ServerSwitchComponent} from "../components/server-switch/server-switch.component";
import {ItemComponent} from "../components/playlist/item/item.component";
import {LibraryPage} from "../pages/library/library";
import {PlaylistComponent} from "../components/playlist/playlist.component";
import {ArtistsTab} from "../pages/library/tabs/artists/artists";
import {AlbumsPage} from "../pages/library/tabs/albums/albums";
import {GenresTab} from "../pages/library/tabs/genres/genres";
import {MediumComponent} from "../components/medium/medium.component";
import {PlayerControlsComponent} from "../components/player-controls/player-controls.component";
import {PlayerContainerComponent} from "../components/player-container/player-container.component";
import {CheckerComponent} from "../components/checker/checker.component";
import {MusicalSpinnerComponent} from "../components/musical-spinner/musical-spinner.component";
import {AlbumPage} from "../pages/album/album";

@NgModule({
  declarations: [
    ThePlaylist,
    PlaylistsPage,
    SearchPage,
    CloudPage,
    AuthError,
    SplashPage,
    SettingsPage,
    LibraryPage,

    AlbumPage,

    ArtistsTab,
    AlbumsPage,
    GenresTab,

    DownloadQueueComponent,
    VideoPlayerComponent,
    ServerManagerComponent,
    PlaylistComboComponent,
    PlaylistComponent,

    AddPlaylistComponent,

    SelectComponent,
    ServerSwitchComponent,
    ItemComponent,
    MediumComponent,
    PlayerControlsComponent,

    PlayerContainerComponent,
    CheckerComponent,
    MusicalSpinnerComponent,

    DurationPipe,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ServicesModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(ThePlaylist, {
      // backButtonText: 'Go Back',
      iconMode: 'ios',
      modalEnter: 'modal-slide-in',
      modalLeave: 'modal-slide-out',
      tabsPlacement: 'bottom',
      pageTransition: 'ios-transition'
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ThePlaylist,
    PlaylistsPage,
    SearchPage,
    CloudPage,
    AuthError,
    SplashPage,
    SettingsPage,
    LibraryPage,

    AlbumPage,

    ArtistsTab,
    AlbumsPage,
    GenresTab,

    DownloadQueueComponent,
    VideoPlayerComponent,
    ServerManagerComponent,

    PlaylistComponent,
    AddPlaylistComponent,
    PlayerControlsComponent,
    CheckerComponent,
    MusicalSpinnerComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},

    GooglePlus,
    BackgroundMode,
    ScreenOrientation,
    Keyboard,
    AndroidFullScreen,
    Insomnia
  ]
})
export class AppModule {
}
