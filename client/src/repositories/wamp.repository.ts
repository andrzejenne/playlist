import {Injectable} from "@angular/core";
import {WampService} from "../services/WampService";
import {ConfigService} from "../services/ConfigService";
import {AlertController} from "ionic-angular";

@Injectable()
export class WampRepository {
  constructor(protected wamp: WampService, protected config: ConfigService, protected alert: AlertController) {

  }

  call<T>(cmd: string, ...args) {
    console.info('WampRepository@call', cmd, ...args);
    return new Promise<T>((resolve, reject) => {
      try {
        this.wamp.call<T>(cmd, ...args)
          .then(response => {
            console.info('WampRepository@call.response', response);
            return resolve(response)
          })
          .catch(error => {

            console.error('WAMP: Unexepcted Error', error);

            let message = null;
            if (error.args && error.args.length) {
              message = error.args.implode('<br>');
            }
            else if (error.message) {
              message = error.message;
            }
            else {
              message = 'unknown error';
            }

            this.alert.create({
              title: 'Unexepected Error',
              subTitle: ['Error calling', cmd].join(' '),
              message: message
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
