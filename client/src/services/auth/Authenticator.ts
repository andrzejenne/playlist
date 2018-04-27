import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";
import {User} from "../../models/user";

@Injectable()
export abstract class Authenticator {

  private user: User;

  abstract authenticate(): Promise<any>;

  protected constructor(protected storage: Storage) {
  }

  isAuthenticated(): Promise<boolean> {
    return this.currentUser()
      .then(user => user && user.id > 0);
  }

  logout(): Promise<boolean> {
    return this.storage.remove('user')
      .then(result => {
        this.user = null;

        return true;
      })
      .catch(error => false);
  }

  currentUser(): Promise<User> {
    return this.storage.get('user')
      .then(user => {
        this.user = user;
        return user;
      })
      .catch(error => {
        this.user = null;
        // @todo - report error
      });
  }

  setUser(user) {
    this.user = user;

    return this.storage.set('user', user);
  }
}
