import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";
import {User} from "../../models/user";

@Injectable()
export abstract class Authenticator {

  private user: {[index: string]: User};

  abstract authenticate(host: string): Promise<any>;

  protected constructor(protected storage: Storage) {
  }

  isAuthenticated(host: string): Promise<boolean> {
    return this.currentUser(host)
      .then(user => {
        return user && user.id > 0
      });
  }

  logout(host: string): Promise<boolean> {
    delete this.user[host];
    return this.storage.set('user', this.user)
      .then(result => true)
      .catch(error => false);
  }

  currentUser(host: string): Promise<User> {
    return this.storage.get('user')
      .then(user => {
        this.user = user;
        return user[host];
      })
      .catch(error => {
        this.user = null;
        // @todo - report error
      });
  }

  setUser(host: string, user: User) {
    if (!this.user) {
      this.user = {};
    }
    this.user[host] = user;

    return this.storage.set('user', this.user);
  }
}
