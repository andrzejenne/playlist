import {Injectable} from "@angular/core";
import {Authenticator} from "./Authenticator";
import {GooglePlus} from "@ionic-native/google-plus";
import {Storage} from "@ionic/storage";
import {HttpClient} from "@angular/common/http";
import {ServerManagerService} from "../ServerManagerService";
import {ConfigService} from "../ConfigService";

@Injectable()
export class MobileAuthenticator extends Authenticator {
  constructor(
    private config: ConfigService,
    private googlePlus: GooglePlus,
    protected storage: Storage,
    private serverManager: ServerManagerService,
    private http: HttpClient
  ) {
    super(storage);
  }

  public authenticate(host: string) {
    console.info('authenticate');
    return new Promise((resolve, reject) => {
      this.serverManager.ready()
        .then(servers => {
          this.googlePlus.login({
            clientId: this.config.config.oauth.googleId,
            offline: true
          })
            .then(response => {
              // console.info('auth.mobile.google', response);
              // this.storage.set('userEmail', response.email);

              // for (let host in servers) {
                this.http.get(
                  this.serverManager.getServerUrl(host, this.config.get('auth.userUrl') + 'email/?value=' + response.email), // @todo - not safe
                  {
                    withCredentials: true
                  }
                ).subscribe((response: any) => { // @todo - contract
                    if (response !== null && response.id) {
                      this.setUser(host, response);
                      resolve(response);
                    }
                    else {
                      reject('not authenticated');
                      // this.authenticateMe();
                    }
                  },
                  error => {
                    console.info('ERROR:', error);
                    reject(error);

                    return false;
                  });
              // }
              // return response;
            })
            .catch(error => {
              console.info('auth.mobile.google.error', error);
            });
        });
    });

  }

  public logout(host: string) {
    return this.googlePlus.logout()
      .then(response => super.logout(host));
  }
}
