import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Album} from "../../../../models/album";
import {AlbumPage} from "../../../album/album";

@Component({
  selector: 'page-home',
  templateUrl: 'albums.html'
})
export class AlbumsPage {

  albums: Album[] = [];

  constructor(params: NavParams, private navCtrl: NavController) {
    console.info(params);
    this.albums = params.data || [];
  }

  openAlbum(album: Album) {
    this.navCtrl.push(AlbumPage, {album: album});
  }
}
