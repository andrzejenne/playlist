import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {Authenticator} from "./Authenticator";
import {ConfigService} from "../ConfigService";

@Injectable()
export class WebAuthenticator extends Authenticator {

    constructor(private config: ConfigService, private http: HttpClient) {
        super();
    }

    authenticate() {
        return new Promise(this.authenticationCallback);
    }

    logout() {
        return new Promise(this.logoutCallback);
    }

    private authenticationCallback = (resolve, reject) => {
        this.http.get(
                this.config.get('auth.userUrl'),
                {
                    withCredentials: true
                }
            )
                .subscribe((response:any) => { // @todo - contract
                  debugger;
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
                  debugger;
                        console.info('ERROR:', error);
                        reject(error);
                    });
    };

    private logoutCallback = (resolve, reject) => {
        super.logout();

        return this.http.delete(this.config.get('auth.userUrl'))
            .subscribe(response => resolve(response), error => reject(error));
    };

    private authenticateMe() {
        window.location.href = this.config.get('auth.requestUrl')
            // + '?token=' + token
            + '&redirect=' + this.config.get('auth.redirectUrl')
    }
}