import {ChangeDetectorRef, Component, Input, OnDestroy} from "@angular/core";
import {LoadingController, NavController, NavParams} from "ionic-angular";
import {Genre} from "../../../../models/genre";
import {LibraryManagerService} from "../../../../services/LibraryManagerService";
import {MediaComponent} from "../../../../components/media/media.component";
import {MediaManagerService} from "../../../../services/MediaManagerService";
import {Subscription} from "rxjs/Subscription";
import {Subject} from "rxjs/Subject";
import {Playlist} from "../../../../models/playlist";

@Component({
  selector: 'genres-tab',
  templateUrl: 'genres.html'
})
export class GenresTab implements OnDestroy {

  all: Genre[] = [];

  list: Genre[] = [];

  count: number;

  search = '';

  @Input()
  playlist: Playlist;

  private limit = 30;

  private offset = 0;

  private end = false;

  private filterSubject = new Subject();

  private subs: Subscription[] = [];

  constructor(
    params: NavParams,
    private nav: NavController,
    private loaderCtrl: LoadingController,
    private libManager: LibraryManagerService,
    private mediaManager: MediaManagerService,
    private ref: ChangeDetectorRef
  ) {
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

  openGenre(genre: Genre, autoplay = false) {
    if (!genre.media) {
      let loader = this.loaderCtrl.create({
        spinner: 'crescent',
        content: 'Loading ...'
      });
      loader.present();

      this.mediaManager.getByGenre(genre)
        .then(media => {
          genre.media = media;
          this.nav.push(MediaComponent, {
            media: genre.media,
            title: genre.name,
            autoplay: autoplay,
            playlist: this.playlist
          });
          loader.dismiss();
        });
    }
    else {
      this.nav.push(MediaComponent, {
        media: genre.media,
        title: genre.name,
        autoplay: autoplay,
        playlist: this.playlist
      });
    }
  }

  play(genre: Genre) {
    this.openGenre(genre, true);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private load() {
    return this.libManager.genres(this.limit, this.offset, this.search)
      .then(data => {
        console.info('GenresTab.data', data);
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
}
