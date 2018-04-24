import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
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

@NgModule({
    declarations: [
        ThePlaylist,
        HomePage,
        SearchPage,
        DownloadedPage,
        AuthError,
        WelcomePage,

        DownloadQueueComponent,

        DurationPipe
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        ServicesModule,
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

        DownloadQueueComponent,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},

        GooglePlus,
        BackgroundMode,
    ]
})
export class AppModule {
}
