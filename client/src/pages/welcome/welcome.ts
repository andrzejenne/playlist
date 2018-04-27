import {Component} from '@angular/core';
import {NavController} from "ionic-angular";

@Component({
  selector: 'welcome',
  templateUrl: 'welcome.html'
})
export class WelcomePage {
  constructor(public navCtrl: NavController) {
  }
}
