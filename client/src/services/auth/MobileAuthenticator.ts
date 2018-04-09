import {Injectable} from "@angular/core";
import {Authenticator} from "./Authenticator";

@Injectable()
export class MobileAuthenticator extends Authenticator {
    authenticate() {
        throw 'stub';
    }
}