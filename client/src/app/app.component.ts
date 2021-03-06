import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
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
import {WampService} from "../services/WampService";
import {Provider} from "../models/provider";
import {AppRepository} from "../repositories/app.repository";
import {Observable} from "rxjs/Observable";
import {OfflineManagerService} from "../services/OfflineManagerService";
import {ConnectionHelperComponent} from "../components/connection-helper/connection-helper.component";

@Component({
  templateUrl: 'app.component.html'
})
export class ThePlaylist {
  rootPage: any = SplashPage;

  authenticated: boolean = false;

  @ViewChild('content') nav: NavController;
  @ViewChild('menu') menu: MenuController;

  dayMode: boolean = true;

  dayModeIcon: string = 'sunny';

  // @HostBinding('class')
  dayModeClass: string = 'day-mode';

  servers: string[] = [];

  providers: Provider[] = [];

  searchableProviders: Provider[] = [];

  bottomMargin: number = 0;

  closed: {
    title?: string,
    host?: string,
    message?: string,
  } = {};

  connectionClosed = false;

  @ViewChild(ConnectionHelperComponent) connectionHelper;

  private settings: SettingsContract;

  private host: string;

  private ionApp: Element;

  private onConnectionLost = (host: string) => {
    this.openReconnectModal('Connection Lost', 'Connection to ' + host + ' has been lost.', host);
  };

  private onConnectionUnreachable = (host: string) => {
    this.openReconnectModal('Server Unreachable', host + ' is unreachable.', host);
  };

  private closeReasonHandlers = {
    lost: this.onConnectionLost,
    unreachable: this.onConnectionUnreachable
  };

  constructor(
    private platform: Platform,
    private serverManager: ServerManagerService,
    private wamp: WampService,
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
    private config: ConfigService,
    private menuCtrl: MenuController,
    private appRepo: AppRepository,
    private offline: OfflineManagerService,
    private ref: ChangeDetectorRef
  ) {

    this.config.settings$.subscribe(settings => {
      if (settings) {
        this.settings = settings;

        if (settings.dayMode) {
          this.dayMode = settings.dayMode.value;
          if (this.ionApp) {
            this.setDayModeClass();
          }
        }

      }
    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      this.prepareApp();

      this.prepareAuth();

      this.ionApp = document.getElementsByTagName('ion-app')[0];
      if (this.settings) {
        this.setDayModeClass();
      }
    });

  }

  setPage(code: string, params?: any) {
    console.info('App@setPage', code, params);
    let page = this.pages.get(code);
    let view = this.nav.getActive();
    if (page !== view.component) {
      this.nav.push(
        page,
        params
      );
    }
  }

  setPageByProvider(provider: Provider) {
    this.setPage(provider.ionic.component, {
      provider: provider.slug,
      title: provider.ionic.title
    });
  }

  goToSettings() {
    return this.nav.push(SettingsPage)
      .then(finished => this.menu.close());
  }

  onDayModeChange() {
    this.dayModeIcon = this.dayMode ? 'sunny' : 'moon';

    this.setDayModeClass();

    this.settings.dayMode.value = this.dayMode;
    this.config.save(this.settings);
  }

  switchServer(host: string) {
    this.host = host;
    this.auth.authenticateAndConnectToHost(host);
  }

  setDayModeClass() {
    this.dayModeClass && this.ionApp && this.ionApp.classList.remove(this.dayModeClass);
    this.dayModeClass = this.dayMode ? 'day-mode' : 'night-mode';
    this.ionApp.classList.add(this.dayModeClass);
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
    this.splashScreen.hide();

    if (this.platform.is('cordova')) {
      this.statusBar.styleDefault();

      // @todo - enable background mode only when playing something ???
      this.backgroundMode.on('activate')
        .subscribe(() => {
          this.backgroundMode.disableWebViewOptimizations();
        });

      this.backgroundMode.setDefaults({
        title: 'The Playlist',
        text: 'Waiting for interaction',
        // silent: true
      }).then(
        result => this.backgroundMode.enable()
      );

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

    // loads providers
    this.wamp.connected.subscribe(host => {

      this.connectionClosed = false;

      this.ref.detectChanges();

      this.appRepo.providers()
        .then(providers => {
          this.providers = providers;
          this.searchableProviders = providers.filter(provider => provider.search);
          this.serverManager.setProviders(providers, host);

          this.ref.detectChanges();
        });
    });

    this.wamp.onClose.subscribe(({server, reason}) => {
      if (this.connectionClosed) {
        this.connectionHelper.resetCounter();
      }
      else {
        if (this.closeReasonHandlers[reason]) {
          this.closeReasonHandlers[reason](server.host);
        }
      }
    });


    Observable.fromEvent(window, 'keyboardWillShow').subscribe((e) => {
      this.setBottomMargin(e['keyboardHeight'] || 0);
    });

    Observable.fromEvent(window, 'keyboardWillHide').subscribe((e) => {
      this.setBottomMargin(0);
    });

    this.menuCtrl.enable(false, 'playlistMenu');

    if (this.offline.enabled) {
      console.info('Oflline is enabled');
    }
    else {
      console.warn('offline mode not avail');
    }

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

  /**
   *
   * @param {string} title
   * @param {string} message
   * @param {string} host
   */
  openReconnectModal(title: string, message: string, host: string) {
    this.closed = {
      title: title,
      message: message,
      host: host,
    };
    this.connectionClosed = true;

    this.ref.detectChanges();
  }

  private setBottomMargin(height: number) {
    this.bottomMargin = height;
  }
}

