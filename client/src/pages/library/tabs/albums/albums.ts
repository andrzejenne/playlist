import {Component} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {Album} from "../../../../models/album";

@Component({
  selector: 'page-home',
  templateUrl: 'albums.html'
})
export class AlbumsPage {

  albums: Album[] = [];

  constructor(params: NavParams) {
    console.info(params);
    this.albums = params.data || [];
  }
}
