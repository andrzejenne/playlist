import {Injectable} from "@angular/core";
import {Authenticator} from "./Authenticator";
import {GooglePlus} from "@ionic-native/google-plus";
import {Storage} from "@ionic/storage";

@Injectable()
export class MobileAuthenticator extends Authenticator {
  constructor(private googlePlus: GooglePlus, protected storage: Storage) {
    super(storage);
  }

  public authenticate() {
    return this.googlePlus.login({})
  }

  public logout() {
    return new Promise(this.logoutCallback);
  }

  private logoutCallback = (resolve, reject) => {
    return this.googlePlus.logout()
      .then(response => super.logout()
        .then(finished => resolve(response))
      )
      .catch(error => reject(error));
  };
}
