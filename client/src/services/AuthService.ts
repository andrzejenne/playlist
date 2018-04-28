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

@Injectable()
export class AuthService {

  private authenticator: Authenticator;

  public logout$ = new Subject<boolean>();

  constructor(config: ConfigService, http: HttpClient, google: GooglePlus, storage: Storage, serverManager: ServerManagerService) {
    console.info('isWebApp', config.isWebApp, document.URL);
    if (config.isWebApp) {
      this.authenticator = new WebAuthenticator(config, storage, serverManager, http);
    }
    else {
      this.authenticator = new MobileAuthenticator(config, google, storage, serverManager, http);
    }
  }

  isAuthenticated() {
    return this.authenticator.isAuthenticated();
  }

  authenticate() {
    return this.authenticator.authenticate();
  }

  getUser() {
    return this.authenticator.currentUser();
  }

  logout() {
    this.authenticator.logout()
      .then(
        response => this.logout$.next(true)
      )
      .catch(
        error => this.logout$.next(false)
      )
  }
}
