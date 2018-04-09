import {Injectable} from "@angular/core";

@Injectable()
export abstract class Authenticator {

    private user;

    abstract authenticate();

    isAuthenticated() {
        return this.currentUser() !== null;
    }

    logout() {
        localStorage.removeItem('user');
        this.user = null;
    }

    currentUser(): any{ // @todo - user interface
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