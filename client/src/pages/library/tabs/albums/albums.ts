import {ChangeDetectorRef, Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Album} from "../../../../models/album";
import {AlbumPage} from "../../../album/album";
import {Artist} from "../../../../models/artist";
import {LibraryManagerService} from "../../../../services/LibraryManagerService";
import {MediaManagerService} from "../../../../services/MediaManagerService";

@Component({
  selector: 'albums-tab',
  templateUrl: 'albums.html'
})
export class AlbumsTab {

  all: Artist[] = [];

  list: Artist[] = [];

  count: number;

  search = '';

  private limit = 30;

  private offset = 0;

  private end = false;

  constructor(params: NavParams,
              private libManager: LibraryManagerService,
              private mediaManager: MediaManagerService,
              private navCtrl: NavController,
              private ref: ChangeDetectorRef
  ) {
    this.count = params.data || [];
  }

  ngAfterViewInit() {
    this.load()
      .then(data => this.ref.detectChanges());
  }

  getCover(album: Album) {
    return this.mediaManager.getCoverUrl(album);
  }

  private load() {
    return this.libManager.albums(this.limit, this.offset)
      .then(data => {
        console.info('AlbumsPage.data', data);
        if (data.length != this.limit) {
          this.end = true;
        }
        if (this.offset) {
          this.all = this.all.concat(data);
          this.list = [].concat(this.all);
        }
        else {
          this.all = data;
          this.list = [].concat(data);
        }
        this.ref.detectChanges();
      });
  }

  doInfinite(infiniteScroll: any) {
    console.log('doInfinite, start is currently ' + this.offset);

    if (!this.end) {
      this.offset += this.limit;

      this.load()
        .then(data => infiniteScroll.complete());
    }
    else {
      infiniteScroll.complete();
    }
  }

  openAlbum(album: Album) {
    this.navCtrl.push(AlbumPage, {album: album});
  }

  filter() {
    this.offset = 0;
    this.end = false;

    this.load();
    /*
    if (this.search) {
      this.list = this.downloaded.filter(item => {
        return item && item.name && item.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      });
    }
    else {
      this.list = [].concat(this.downloaded);
    }
    */
  }
}
