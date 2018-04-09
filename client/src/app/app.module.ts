import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {GooglePlus} from "@ionic-native/google-plus";

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {SearchRepository} from '../repositories/search.repository';
import {SearchBarComponent} from "../pages/home/search-bar.component";
import {DurationPipe} from "../pipes/duration";

import {ConfigService} from "../services/ConfigService";
import {WampService} from "../services/WampService";
import {BackgroundMode} from "@ionic-native/background-mode";
import {AuthService} from "../services/AuthService";

@NgModule({
    declarations: [
        MyApp,
        HomePage,

        SearchBarComponent,

        DurationPipe
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(MyApp),
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},

        SearchRepository,

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
