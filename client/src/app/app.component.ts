import {Component, ViewChild} from '@angular/core';
import {MenuController, NavController, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {BackgroundMode} from "@ionic-native/background-mode";
import {AuthError} from "../pages/auth/error";
import {AuthService} from "../services/AuthService";
import {PagesService} from "../services/PagesService";

import {HomePage} from '../pages/home/home';
import {WelcomePage} from "../pages/welcome/welcome";
import {ServerManagerService} from "../services/ServerManagerService";
import {WampService} from "../services/WampService";

@Component({
  templateUrl: 'app.html'
})
export class ThePlaylist {
  rootPage: any = WelcomePage;

  authenticated: boolean = false;

  @ViewChild('content') nav: NavController;
  @ViewChild('menu') menu: MenuController;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    backgroundMode: BackgroundMode,
    private serverManager: ServerManagerService,
    private wamp: WampService,
    private auth: AuthService,
    private pages: PagesService
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // @todo - enable background mode only when playing something
      backgroundMode.enable();

      auth.logout$.subscribe(result => this.authenticated = !result);

      this.serverManager.ready()
        .then(this.onServersReady);
    });

  }

  setPage(code: string) {
    let page = this.pages.get(code);
    let view = this.nav.getActive();
    if (page !== view.component) {
      this.nav.push(
        page
      );
    }
  }

  private onAuthenticated(response) {
    this.authenticated = true;
    this.rootPage = HomePage;
  }

  private onAuthenticationError(error) {
    this.authenticated = false;
    this.rootPage = AuthError;

    console.error('AuthError', error);
  }

  private onIsAuthenticated = (is) => {
    if (!is) {
      this.auth.authenticate()
        .then(response => this.onAuthenticated(response))
        .catch(error => this.onAuthenticationError(error));
    }
    else {
      this.onAuthenticated(true);
    }
  };

  private onServersReady = (servers) => {
    if (Object.keys(servers).length) {
      this.serverManager.each(server => this.wamp.connect(server));
      this.auth.isAuthenticated()
        .then(this.onIsAuthenticated);
    }
  };
}

