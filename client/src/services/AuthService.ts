import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Authenticator} from "./auth/Authenticator";
import {ConfigService} from "./ConfigService";
import {WebAuthenticator} from "./auth/WebAuthenticator";
import {MobileAuthenticator} from "./auth/MobileAuthenticator";

@Injectable()
export class AuthService {

    private authenticator: Authenticator;

    constructor(config: ConfigService, http: HttpClient) {
        if (config.isWebApp) {
            this.authenticator = new WebAuthenticator(config, http);
        }
        else {
            this.authenticator = new MobileAuthenticator();
        }
    }

    isAuthenticated() {
        return this.authenticator.isAuthenticated();
    }

    authenticate() {
        return this.authenticator.authenticate();
    }
}