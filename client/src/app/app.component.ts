import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {HomePage} from '../pages/home/home';
import {BackgroundMode} from "@ionic-native/background-mode";
import {AuthService} from "../services/AuthService";

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any = HomePage;

    constructor(platform: Platform,
                statusBar: StatusBar,
                splashScreen: SplashScreen,
                backgroundMode: BackgroundMode,
                auth: AuthService
    ) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();
            splashScreen.hide();

            // @todo - enable background mode only when playing something
            backgroundMode.enable();

            if (!auth.isAuthenticated()) {
                auth.authenticate();
            }
        });
    }
}

