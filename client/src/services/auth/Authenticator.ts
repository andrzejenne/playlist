import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";

@Injectable()
export abstract class Authenticator {

  private user;

  abstract authenticate(): Promise<any>;

  protected constructor(protected storage: Storage) {
    this.storage.get('user')
      .then(user => {
        this.user = user;
      })
      .catch(error => {
        this.user = null;
      });
  }

  isAuthenticated() {
    let user = this.currentUser();

    return user && user.id > 0;
  }

  logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.remove('user')
        .then(result => {
          this.user = null;
          resolve(result)
        })
        .catch(error => reject(error));
    });
  }

  currentUser(): any {
    return this.user;
  }

  setUser(user) {
    this.user = user;
    return this.storage.set('user', user);
  }
}
