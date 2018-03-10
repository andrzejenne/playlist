import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  public search: string;

  constructor(public navCtrl: NavController) {

  }

  public onSearchChange(str: string) {

  }

  public getItems() {
    console.info('getItems');
    return [];
  }
}
