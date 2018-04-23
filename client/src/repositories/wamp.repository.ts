import {Injectable} from "@angular/core";
import {WampService} from "../services/WampService";
import {ConfigService} from "../services/ConfigService";

@Injectable()
export class WampRepository {
    constructor(protected wamp: WampService, protected config: ConfigService) {

    }

    call<T>(cmd: string, ...args) {
        return new Promise<T>((resolve, reject) => {
            try {
                this.wamp.call<T>(cmd, ...args)
                    .then(response => resolve(response))
                    .catch(error => reject({message: error.message || error}));
            }
            catch (e) {
                reject({message: e.message || e});
            }
        });
    }
}