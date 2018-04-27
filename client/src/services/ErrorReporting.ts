import {Injectable} from "@angular/core";
import {AlertController} from "ionic-angular";

@Injectable()
export class ErrorReporting {
  constructor(private alertCtrl: AlertController) {

  }

  report = (error: any) => {
    this.alertCtrl.create({
      title: 'Error!',
      subTitle: error.message || 'error occured',
      buttons: ['Ok']
    }).present();
  }
}