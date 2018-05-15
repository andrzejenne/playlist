import {ChangeDetectorRef, Component, HostBinding, ViewChild} from '@angular/core';
import {MenuController, NavController, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {AndroidFullScreen} from '@ionic-native/android-full-screen';

import {BackgroundMode} from "@ionic-native/background-mode";
import {AuthService} from "../services/AuthService";
import {PagesService} from "../services/PagesService";

import {SplashPage} from "../pages/splash/splash";
import {SettingsPage} from "../pages/settings/settings";
import {PlaylistsPage} from "../pages/playlists/playlists";

import {FullscreenObserverService} from "../services/FullscreenObserverService";
import {Insomnia} from "@ionic-native/insomnia";
import {ServerManagerService} from "../services/ServerManagerService";
import {ConfigService} from "../services/ConfigService";
import {SettingsContract} from "../services/contracts/SettingsContract";

@Component({
  templateUrl: 'app.html'
})
export class ThePlaylist {
  rootPage: any = SplashPage;

  authenticated: boolean = false;

  @ViewChild('content') nav: NavController;
  @ViewChild('menu') menu: MenuController;

  dayMode: boolean = true;

  dayModeIcon: string = 'sunny';

  @HostBinding('class')
  dayModeClass: string = 'day-mode';

  servers: string[] = [];

  private settings: SettingsContract;

  private host: string;

  constructor(
    platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private backgroundMode: BackgroundMode,
    // private serverManager: ServerManagerService,
    private auth: AuthService,
    private pages: PagesService,
    // private storage: Storage,
    private immersive: AndroidFullScreen,
    private fullscreenObserver: FullscreenObserverService,
    private insomnia: Insomnia,
    private serverManager: ServerManagerService,
    private config: ConfigService,
    private menuCtrl: MenuController,
    private ref: ChangeDetectorRef
  ) {

    this.config.settings$.subscribe(settings => {
      if (settings) {
        this.settings = settings;

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

  switchServer(host: string) {
    this.host = host;
    this.auth.authenticateAndConnectToHost(host);
  }

  // private onAuthenticated(response) {
  //   this.authenticated = true;
  //   // this.nav.setRoot(PlaylistsPage);
  // }
  //
  // private onAuthenticationError(error) {
  //   this.authenticated = false;
  //   this.rootPage = AuthError;
  //
  //   console.error('AuthError', error);
  // }

  // private onIsAuthenticated = (is) => {
  //   console.info('onIsAuthenticated', is);
  //
  //   if (!is) {
  //     this.auth.authenticate()
  //       .then(response => this.onAuthenticated(response))
  //       .catch(error => this.onAuthenticationError(error));
  //   }
  //   else {
  //     this.onAuthenticated(true);
  //   }
  // };

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

    this.menuCtrl.enable(false, 'playlistMenu');
  }

  private prepareAuth() {
    // @todo - add subscriptions for cleanup
    this.auth.logout$.subscribe(result => this.authenticated = !result);

    this.serverManager.ready()
      .then(servers => {

        servers && (this.servers = Object.keys(servers));

        this.rootPage = PlaylistsPage;

        this.ref.detectChanges();

        this.config.settings$.subscribe(settings => {
          if (settings && settings.server && this.host != settings.server) {
            this.host = settings.server;
            this.auth.authenticateAndConnectToHost(settings.server);
          }
        });

        this.serverManager.servers$.subscribe(servers => servers && (this.servers = Object.keys(servers)));

      });
  }
}

