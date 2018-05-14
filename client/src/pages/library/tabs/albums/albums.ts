// import {Component} from "@angular/core";
// import {NavController} from "ionic-angular";
//
// @Component({
//   selector: 'albums-tab',
//   templateUrl: 'albums.html'
// })
// export class AlbumsPage {
//   constructor(public navCtrl: NavController) {
//
//   }
// }

import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'albums.html'
})
export class AlbumsPage {

  constructor(public navCtrl: NavController) {

  }

}
