import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {HomePage} from '../pages/home/home';
import {BackgroundMode} from "@ionic-native/background-mode";
import {AuthService} from "../services/AuthService";
import {AuthError} from "../pages/auth/error";
import {WelcomePage} from "../pages/welcome/welcome";

@Component({
    templateUrl: 'app.html'
})
export class ThePlaylist {
    rootPage: any = WelcomePage;

    authenticated: boolean = false;

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

            auth.logout$.subscribe(result => this.authenticated = !result);

            if (!auth.isAuthenticated()) {
                auth.authenticate()
                    .then(response => this.onAuthenticated())
                    .catch(error => this.onAuthenticationError());
            }
            else {
                this.onAuthenticated();
            }
        });
    }

    onAuthenticated() {
        this.authenticated = true;
        this.rootPage = HomePage;
    }

    onAuthenticationError() {
        this.authenticated = false;
        this.rootPage = AuthError;
    }
}

