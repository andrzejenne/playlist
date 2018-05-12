import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {IonicStorageModule} from '@ionic/storage';

import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {GooglePlus} from "@ionic-native/google-plus";

import {ThePlaylist} from './app.component';
import {HomePage} from '../pages/home/home';
import {SplashPage} from "../pages/splash/splash";
import {SearchPage} from '../pages/search/search';

import {DurationPipe} from "../pipes/duration";

import {BackgroundMode} from "@ionic-native/background-mode";
import {Keyboard} from "@ionic-native/keyboard";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {Insomnia} from '@ionic-native/insomnia';

import {AuthError} from "../pages/auth/error";

import {ServicesModule} from "./services.module";
import {DownloadedPage} from "../pages/downloaded/downloaded";
import {DownloadQueueComponent} from "../components/download-queue/download-queue.component";
import {VideoPlayerComponent} from "../components/video-player/video-player.component";
import {ServerManagerComponent} from "../components/server-manager/server-manager.component";
import {SettingsPage} from "../pages/settings/settings";
import {PlaylistComboComponent} from "../components/playlists-combo/playlist-combo.component";
import {AddPlaylistComponent} from "../pages/home/playlist/add-playlist.component";
import {AndroidFullScreen} from '@ionic-native/android-full-screen';
import {SelectComponent} from "../components/select/select.component";
import {ServerSwitchComponent} from "../components/server-switch/server-switch.component";
import {ItemComponent} from "../pages/home/item/item.component";

@NgModule({
  declarations: [
    ThePlaylist,
    HomePage,
    SearchPage,
    DownloadedPage,
    AuthError,
    SplashPage,
    SettingsPage,

    DownloadQueueComponent,
    VideoPlayerComponent,
    ServerManagerComponent,
    PlaylistComboComponent,

    AddPlaylistComponent,

    SelectComponent,
    ServerSwitchComponent,
    ItemComponent,

    DurationPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ServicesModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(ThePlaylist),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ThePlaylist,
    HomePage,
    SearchPage,
    DownloadedPage,
    AuthError,
    SplashPage,
    SettingsPage,

    DownloadQueueComponent,
    VideoPlayerComponent,
    ServerManagerComponent,
    PlaylistComboComponent,

    AddPlaylistComponent,
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
