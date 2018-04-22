import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {GooglePlus} from "@ionic-native/google-plus";

import {ThePlaylist} from './app.component';
import {HomePage} from '../pages/home/home';
import {SearchRepository} from '../repositories/search.repository';
import {DurationPipe} from "../pipes/duration";

import {ConfigService} from "../services/ConfigService";
import {WampService} from "../services/WampService";
import {BackgroundMode} from "@ionic-native/background-mode";
import {AuthService} from "../services/AuthService";
import {AuthError} from "../pages/auth/error";
import {WelcomePage} from "../pages/welcome/welcome";
import {DownloadedRepository} from "../repositories/downloaded.repository";

@NgModule({
    declarations: [
        ThePlaylist,
        HomePage,
        AuthError,
        WelcomePage,

        DurationPipe
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(ThePlaylist),
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        ThePlaylist,
        HomePage,
        AuthError,
        WelcomePage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},

        SearchRepository,
        DownloadedRepository,

        ConfigService,
        WampService,

        GooglePlus,
        BackgroundMode,

        // services
            // auth
        AuthService
    ]
})
export class AppModule {
}
