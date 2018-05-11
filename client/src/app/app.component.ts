import {Component, HostBinding, ViewChild} from '@angular/core';
import {MenuController, NavController, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {AndroidFullScreen} from '@ionic-native/android-full-screen';
// import {Storage} from '@ionic/storage';

import {BackgroundMode} from "@ionic-native/background-mode";
import {AuthError} from "../pages/auth/error";
import {AuthService} from "../services/AuthService";
import {PagesService} from "../services/PagesService";

import {SplashPage} from "../pages/splash/splash";
import {SettingsPage} from "../pages/settings/settings";
import {FullscreenObserverService} from "../services/FullscreenObserverService";
import {Insomnia} from "@ionic-native/insomnia";
import {ServerManagerService} from "../services/ServerManagerService";
import {ConfigService} from "../services/ConfigService";
import {SettingsContract} from "../services/contracts/SettingsContract";
import {HomePage} from "../pages/home/home";
import {Server} from "../models/server";
// import {MediaManagerService} from "../services/MediaManagerService";

@Component({
  templateUrl: 'app.html'
})
export class ThePlaylist {
  rootPage: any = SplashPage;

  authenticated: boolean = false;

  @ViewChild('content') nav: NavController;
  @ViewChild('menu') menu: MenuController;

  server: string;

  servers: string[] = [];

  serverOptions: { value: any, label: string }[] = [];

  dayMode: boolean = true;

  dayModeIcon: string = 'sunny';

  @HostBinding('class')
  dayModeClass: string = 'day-mode';

  private settings: SettingsContract;

  constructor(
    platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private backgroundMode: BackgroundMode,
    // private serverManager: ServerManagerService,
    // private wamp: WampService,
    private auth: AuthService,
    private pages: PagesService,
    // private storage: Storage,
    private immersive: AndroidFullScreen,
    private fullscreenObserver: FullscreenObserverService,
    private insomnia: Insomnia,
    private serverManager: ServerManagerService,
    private config: ConfigService
  ) {

    this.config.settings$.subscribe(settings => {
      if (settings) {
        this.settings = settings;
        this.server = settings.server;

        if (settings.dayMode) {
          this.dayMode = settings.dayMode.value;
        }
      }
    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      this.prepareApp();


      this.prepareAuth();

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

  goToSettings() {
    return this.nav.push(SettingsPage)
      .then(finished => this.menu.close());
  }

  onDayModeChange() {
    this.dayModeIcon = this.dayMode ? 'sunny' : 'moon';
    this.dayModeClass = this.dayMode ? 'day-mode' : 'night-mode';
    this.settings.dayMode.value = this.dayMode;
    this.config.save(this.settings);
  }

  onServerChange() {
    // console.info(event, this.server);
    this.serverManager.setServer(this.server);
  }

  private onAuthenticated(response) {
    this.authenticated = true;
    // this.nav.setRoot(HomePage);
  }

  private onAuthenticationError(error) {
    this.authenticated = false;
    this.rootPage = AuthError;

    console.error('AuthError', error);
  }

  private onIsAuthenticated = (is) => {
    console.info('onIsAuthenticated', is);

    if (!is) {
      this.auth.authenticate()
        .then(response => this.onAuthenticated(response))
        .catch(error => this.onAuthenticationError(error));
    }
    else {
      this.onAuthenticated(true);
    }
  };

  private prepareApp() {
    this.statusBar.styleDefault();
    this.splashScreen.hide();

    // @todo - enable background mode only when playing something
    this.backgroundMode.enable();
    this.backgroundMode.configure({
      silent: true
    });

    this.immersive.isImmersiveModeSupported()
      .then(
        response => this.immersive.immersiveMode()
      )
      .catch(error => {
        console.error(error);
      });

    this.fullscreenObserver.change$.subscribe(is => {
      if (is) {
        this.insomnia.keepAwake();
        console.info('insomnia.keepAwake');
        // this.alert.create({message: 'is fullscreen'}).present();
      }
      else {
        this.insomnia.allowSleepAgain();
        console.info('insomnia.sleepAgain');
        // this.alert.create({message: 'not fullscreen'}).present();
      }
    });
  }

  private prepareAuth() {
    // @todo - add subscriptions for cleanup
    this.auth.logout$.subscribe(result => this.authenticated = !result);

    this.serverManager.ready()
      .then(servers => {
        this.setupServers(servers);

        this.rootPage = HomePage;

        this.serverManager.servers$.subscribe(
          servers => this.setupServers(servers)
        );
      });
  }

  private setupServers(servers: { [index: string]: Server }) {
    this.servers = Object.keys(servers) || [];
    this.serverOptions = this.servers.map(
      host => {
        return {value: host, label: host.split('.')[0]}
      }
    );

    if (this.servers.length == 1) {
      this.server = this.servers[0];
      this.onServerChange();
    }

    if (this.servers.length && !this.authenticated) {
      this.auth.isAuthenticated()
        .then(this.onIsAuthenticated);
    }
  }

  // private onServersReady = (servers) => {
  //   if (Object.keys(servers).length) {
  //     this.serverManager.each(server => this.wamp.connect(server));
  //   }
  // };
}

