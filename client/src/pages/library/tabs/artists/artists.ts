import {ChangeDetectorRef, Component, Input, OnDestroy} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";
import {Artist} from "../../../../models/artist";
import {LibraryManagerService} from "../../../../services/LibraryManagerService";
import {MediaManagerService} from "../../../../services/MediaManagerService";
import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";
import {ArtistPage} from "../../../artist/artist";
import {Playlist} from "../../../../models/playlist";

@Component({
  selector: 'artists-tab',
  templateUrl: 'artists.html'
})
export class ArtistsTab implements OnDestroy {

  all: Artist[] = [];

  list: Artist[] = [];

  count: number;

  search = '';

  @Input()
  playlist: Playlist;

  private limit = 30;

  private offset = 0;

  private end = false;

  private filterSubject = new Subject();

  private subs: Subscription[] = [];

  constructor(params: NavParams,
              private navCtrl: NavController,
              private mediaManager: MediaManagerService,
              private libManager: LibraryManagerService,
              private ref: ChangeDetectorRef) {
    if (params) {
      this.count = params.data.count || 0;
      this.playlist = params.data.playlist;
    }
  }

  ngAfterViewInit() {
    this.load()
      .then(data => this.ref.detectChanges());

    this.subs.push(
      this.filterSubject.debounceTime(500)
        .subscribe(search => this.load())
    )
  }

  getCover(artist: Artist) {
    return this.mediaManager.getArtistThumbnailUrl(artist);
  }

  private load() {
    return this.libManager.artists(this.limit, this.offset, this.search)
      .then(data => {
        console.info('ArtistsTab.data', data);
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

  // play(artist: Artist) {
  //   if (!artist.media) {
  //     this.mediaManager.getByArtist(artist)
  //       .then(media => {
  //         artist.media = media;
  //         this.player.setMedia(artist.media).playNext();
  //         this.openArtist(artist)
  //       })
  //   }
  //   else {
  //     this.player.setMedia(artist.media).playNext();
  //     this.openArtist(artist);
  //   }
  // }

  openArtist(artist: Artist) {
    this.navCtrl.push(ArtistPage, {
      artist: artist,
      playlist: this.playlist
    });
  }

  filter() {
    this.offset = 0;
    this.end = false;

    this.filterSubject.next(this.search);
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

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

}
