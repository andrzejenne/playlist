import {Injectable} from "@angular/core";
import {WampService} from "../services/WampService";
import {ConfigService} from "../services/ConfigService";
import {AlertController} from "ionic-angular";

@Injectable()
export class WampRepository {
  constructor(protected wamp: WampService, protected config: ConfigService, protected alert: AlertController) {

  }

  call<T>(cmd: string, ...args) {
    return new Promise<T>((resolve, reject) => {
      try {
        this.wamp.call<T>(cmd, ...args)
          .then(response => resolve(response))
          .catch(error => {

            this.alert.create({
              title: 'Unexepected Error',
              subTitle: ['Error calling', cmd].join(' '),
              message: error.message || error
            }).present();

            return reject({message: error.message || error});
          });
      }
      catch (e) {
        reject({message: e.message || e});
      }
    });
  }
}
