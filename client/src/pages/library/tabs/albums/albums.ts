import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Album} from "../../../../models/album";
import {AlbumPage} from "../../../album/album";
import {Artist} from "../../../../models/artist";
import {LibraryManagerService} from "../../../../services/LibraryManagerService";
import {MediaManagerService} from "../../../../services/MediaManagerService";
import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";
import {PlayerService} from "../../../../services/PlayerService";

@Component({
  selector: 'albums-tab',
  templateUrl: 'albums.html'
})
export class AlbumsTab implements OnDestroy {

  all: Artist[] = [];

  list: Artist[] = [];

  count: number;

  search = '';

  end = false;

  private limit = 30;

  private offset = 0;

  private filterSubject = new Subject();

  private subs: Subscription[] = [];

  constructor(params: NavParams,
              private player: PlayerService,
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

    this.subs.push(
      this.filterSubject.debounceTime(500)
        .subscribe(search => this.load())
    )
  }

  getCover(album: Album) {
    return this.mediaManager.getCoverUrl(album);
  }

  private load() {
    return this.libManager.albums(this.limit, this.offset, this.search)
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

  play(album: Album) {
    this.openAlbum(album, true);
  }

  openAlbum(album: Album, play = false) {
    this.navCtrl.push(AlbumPage, {album: album, play: play});
  }

  filter() {
    this.offset = 0;
    this.end = false;

    this.filterSubject.next(this.search);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }


}
