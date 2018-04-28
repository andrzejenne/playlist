import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Storage} from '@ionic/storage';

import {Authenticator} from "./Authenticator";
import {ConfigService} from "../ConfigService";
import {ServerManagerService} from "../ServerManagerService";

@Injectable()
export class WebAuthenticator extends Authenticator {

  constructor(
    private config: ConfigService,
    protected storage: Storage,
    private serverManager: ServerManagerService,
    private http: HttpClient
  ) {
    super(storage);
  }

  authenticate() {
    return new Promise(this.authenticationCallback);
  }

  logout(): Promise<boolean> {
    return new Promise(this.logoutCallback);
  }

  private authenticationCallback = (resolve, reject) => {
    this.serverManager.ready()
      .then(servers => {
        for (let host in servers) {
          this.http.get(
            this.serverManager.getServerUrl(host, this.config.get('auth.userUrl')),
            {
              withCredentials: true
            }
          )
            .subscribe((response: any) => { // @todo - contract
                if (response !== null && response.id) {
                  this.setUser(response);
                  resolve(response);
                }
                else {
                  reject('not authenticated');
                  this.authenticateMe();
                }
              },
              error => {
                console.info('ERROR:', error);
                reject(error);

                return false;
              });
        }
      })
      .catch(error => reject(error));
  };

  private logoutCallback = (resolve, reject) => {
    super.logout();

    return this.http.delete(this.config.get('auth.userUrl'))
      .subscribe(response => resolve(true), error => reject(error));
  };

  private authenticateMe() {
    window.location.href = this.config.get('auth.requestUrl')
      + '?'
      // + '?token=' + token
      + 'redirect=' + this.config.get('auth.redirectUrl')
  }
}
