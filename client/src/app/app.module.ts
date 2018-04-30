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
import {WelcomePage} from "../pages/welcome/welcome";
import {SearchPage} from '../pages/search/search';

import {DurationPipe} from "../pipes/duration";

import {BackgroundMode} from "@ionic-native/background-mode";
import {AuthError} from "../pages/auth/error";

import {ServicesModule} from "./services.module";
import {DownloadedPage} from "../pages/downloaded/downloaded";
import {DownloadQueueComponent} from "../components/download-queue/download-queue.component";
import {VideoPlayerComponent} from "../components/video-player/video-player.component";
import {ServerManagerComponent} from "../components/server-manager/server-manager.component";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {SettingsPage} from "../pages/settings/settings";
import {PlaylistComboComponent} from "../components/playlists-combo/playlist-combo.component";

@NgModule({
  declarations: [
    ThePlaylist,
    HomePage,
    SearchPage,
    DownloadedPage,
    AuthError,
    WelcomePage,
    SettingsPage,

    DownloadQueueComponent,
    VideoPlayerComponent,
    ServerManagerComponent,
    PlaylistComboComponent,

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
    WelcomePage,
    SettingsPage,

    DownloadQueueComponent,
    VideoPlayerComponent,
    ServerManagerComponent,
    PlaylistComboComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},

    GooglePlus,
    BackgroundMode,
    ScreenOrientation,
  ]
})
export class AppModule {
}
