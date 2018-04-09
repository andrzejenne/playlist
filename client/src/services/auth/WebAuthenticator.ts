import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {UUID} from 'angular2-uuid';

import {Authenticator} from "./Authenticator";
import {ConfigService} from "../ConfigService";

@Injectable()
export class WebAuthenticator extends Authenticator {

    constructor(private config: ConfigService, private http: HttpClient) {
        super();
    }

    authenticate() {
        if (this.hasRequestToken()) {
            // return false;
            this.http.get(this.config.get('auth.userUrl') + '?token=' + this.getRequestToken())
                .subscribe(response => {
                        if (response !== null) {
                            this.setUser(response);
                        }
                        else {
                            this.clearRequestToken();
                            this.authenticateMe();
                        }
                    },
                    error => {
                        console.error('no user');
                        this.clearRequestToken();
                        this.authenticateMe();
                    });
        }
        else {
            this.authenticateMe();
        }
    }

    private authenticateMe() {
        let token = UUID.UUID();
        this.setRequestToken(token);
        window.location.href = this.config.get('auth.requestUrl')
            + '?token=' + token
            + '&redirect=' + this.config.get('auth.redirectUrl')
    }

    private hasRequestToken() {
        return this.getRequestToken() !== null;
    }

    private getRequestToken() {
        return localStorage.getItem('requestToken') || null;
    }

    private setRequestToken(uid: string) {
        localStorage.setItem('requestToken', uid);
    }

    private clearRequestToken() {
        localStorage.removeItem('requestToken');
    }
}