import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Authenticator} from "./auth/Authenticator";
import {ConfigService} from "./ConfigService";
import {WebAuthenticator} from "./auth/WebAuthenticator";
import {MobileAuthenticator} from "./auth/MobileAuthenticator";
import {Subject} from "rxjs/Subject";
import {GooglePlus} from "@ionic-native/google-plus";
import {Storage} from "@ionic/storage";
import {ServerManagerService} from "./ServerManagerService";
import {User} from "../models/user";
import {WampService} from "./WampService";

@Injectable()
export class AuthService {

  private authenticator: Authenticator;

  public logout$ = new Subject<boolean>();

  public user: User;

  constructor(
    config: ConfigService,
    http: HttpClient,
    google: GooglePlus,
    storage: Storage,
    serverManager: ServerManagerService,
    wamp: WampService
  ) {

    console.info('isWebApp', config.isWebApp, document.URL);
    if (config.isWebApp) {
      this.authenticator = new WebAuthenticator(config, storage, serverManager, http);
    }
    else {
      this.authenticator = new MobileAuthenticator(config, google, storage, serverManager, http);
    }

    wamp.connected.subscribe(host => {
      console.info('AuthService.wamp.connected', host);
      if (host) {
        this.isAuthenticated(host)
          .then(is => {
            console.info('AuthService.isAuthenticated.is', is);
            if (is) {
              this.getUser(host)
                .then(user => this.user = user);
            }
            else {
              this.authenticate(host)
                .then(user => this.user = user)
                .catch(error => console.warn('AuthService.ERROR', error));
            }
          })
      }
    });
  }

  isAuthenticated(host: string) {
    console.info('AuthService@isAuthenticated', host);
    return this.authenticator.isAuthenticated(host);
  }

  authenticate(host: string) {
    console.info('AuthService@authenticate', host);
    return this.authenticator.authenticate(host);
  }

  getUser(host: string) {
    console.info('AuthService@getUser', host);
    return this.authenticator.currentUser(host);
  }

  logout(host: string) {
    this.authenticator.logout(host)
      .then(
        response => this.logout$.next(true)
      )
      .catch(
        error => this.logout$.next(false)
      )
  }
}
