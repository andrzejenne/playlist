import {Injectable} from "@angular/core";

@Injectable()
export abstract class Authenticator {

  private user;

  abstract authenticate(): Promise<any>;

  isAuthenticated() {
    let user;
    return (user = this.currentUser()) !== null && user.id;
  }

  logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      localStorage.removeItem('user');
      this.user = null;

      resolve(true);
    });
  }

  currentUser(): any { // @todo - user interface
    if (!this.user) {
      this.user = localStorage.getItem('user') || null;
      if (this.user) {
        this.user = JSON.parse(this.user);
      }
    }

    return this.user;
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}