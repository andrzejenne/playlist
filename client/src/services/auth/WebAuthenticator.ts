import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Storage} from '@ionic/storage';

import {Authenticator} from "./Authenticator";
import {ConfigService} from "../ConfigService";
import {ServerManagerService} from "../ServerManagerService";
import {User} from "../../models/user";

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

  authenticate(host: string) {
    return new Promise((resolve, reject) => {
      console.info('authenticationCallback');
      this.serverManager.ready()
        .then(servers => {
          console.info('serverManager.ready', servers);
          // for (let host in servers) {
          this.http.get(
            this.serverManager.getServerUrl(host, this.config.get('auth.userUrl')),
            {
              withCredentials: true
            }
          )
            .subscribe((response: User) => {
                if (response !== null && response.id) {
                  this.setUser(host, response);
                  resolve(response);
                }
                else {
                  reject('not authenticated');
                  this.authenticateMe(host);
                }
              },
              error => {
                console.info('ERROR:', error);
                reject(error);

                return false;
              });
          // }
        })
        .catch(error => reject(error));
    });
  }

  logout(host: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      super.logout(host);

      return this.http.delete(this.config.get('auth.userUrl'))
        .subscribe(response => resolve(true), error => reject(error));
    });
  }

  private authenticateMe(host: string) {
    window.location.href = this.serverManager.getServerUrl(host, this.config.get('auth.requestUrl'))
      + '?'
      // + '?token=' + token
      + 'redirect=' + this.config.get('auth.redirectUrl')
  }
}
