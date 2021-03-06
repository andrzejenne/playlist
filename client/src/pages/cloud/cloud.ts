import {ChangeDetectorRef, Component, Input, OnDestroy, Optional} from '@angular/core';
import {LoadingController, NavController, NavParams, Platform, ViewController} from 'ionic-angular';
import {CloudRepository} from "../../repositories/cloud.repository";
import {Medium} from "../../models/medium";
// import {ErrorReporting} from "../../services/ErrorReporting";
import {Subscription} from "rxjs/Subscription";
import {User} from "../../models/user";
import {AuthService} from "../../services/AuthService";
import {SelectorService} from "../../services/SelectorService";
import {MediaManagerService} from "../../services/MediaManagerService";
import {ConfigService} from "../../services/ConfigService";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";
import {Playlist} from "../../models/playlist";
import {PlayerService} from "../../services/PlayerService";
import {Subject} from "rxjs/Subject";
import {SearchPage} from "../search/search";

@Component({
  selector: 'page-cloud',
  templateUrl: 'cloud.html',
  providers: [SelectorService]
})
export class CloudPage implements OnDestroy {
  public all: Medium[];

  public list: Medium[];

  public search = '';

  public playlist: Playlist;

  @Input()
  title: string = 'In Cloud';

  @Input()
  provider: string = '';

  @Input()
  download: boolean;

  private user: User;

  private subs: Subscription[] = [];

  private limit = 30;

  private offset = 0;

  private end = false;

  private filterSubject = new Subject();

  constructor(
    public navCtrl: NavController,
    public selector: SelectorService<Medium>,
    public mediaManager: MediaManagerService,
    public platform: Platform,
    public player: PlayerService,
    public plManager: PlaylistsManagerService,
    private repo: CloudRepository,
    private auth: AuthService,
    private loadingCtrl: LoadingController,
    // private errorReporter: ErrorReporting,
    // private modalController: ModalController,
    private config: ConfigService,
    private ref: ChangeDetectorRef,
    private viewCtrl: ViewController,
    @Optional() params: NavParams = null
  ) {
    if (params) {
      if (params.data.playlist) {
        this.playlist = <Playlist>params.data.playlist;
      }
      if (params.data.provider) {
        this.provider = params.data.provider;
      }
      if (params.data.title) {
        this.title = params.data.title;
      }
      if (params.data.download) {
        this.download = params.data.download;
      }
    }

    console.info('CloudPage@constructor', this);
  }

  ionViewDidLoad() {

    this.subs.push(
      this.config.settings$.subscribe(
        settings => {
          if (settings && settings.server) {
            this.auth.getUser(settings.server)
              .then(user => this.user = user);
          }
        }
      ),
      this.filterSubject.debounceTime(500)
        .subscribe(search => this.load())
    );

    this.load();
  }

  toDownload() {
    this.navCtrl.push(SearchPage, {
      playlist: this.playlist,
      provider: this.provider
    });
  }

  playVideo(item: Medium) {
    this.unselectPlaylistIfNotFound(item);
    this.player.playVideoItem(item);
  }

  playAudio(item: Medium) {
    this.unselectPlaylistIfNotFound(item);
    this.player.playAudioItem(item);
  }

  toggleSelect(item: Medium) {
    if (this.mediaManager.canDelete(item)) {
      this.selector.toggleSelect(item);
    }
    this.ref.detectChanges();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  doInfinite(infiniteScroll: any) {
    console.log('doInfinite, start is currently ' + this.offset);

    if (!this.end) {
      this.offset += this.limit;

      this.load(false)
        .then(data => infiniteScroll.complete());
    }
    else {
      infiniteScroll.complete();
    }

  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  filter() {
    this.offset = 0;
    this.end = false;

    this.filterSubject.next(this.search);
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

  removeSelected() {
    let removed = [];
    this.selector.selected
      .forEach(
        item => removed.push(
          this.removeItem(item)
        )
      );

    return Promise.all(removed)
      .then(val => {
        this.selector.clearSelection();
        this.ref.detectChanges();
      });
  }

  private unselectPlaylistIfNotFound(item: Medium) {
    if (this.plManager.playlist) {
      let found = this.plManager.playlist.media.filter(medium => medium.id == item.id);
      if (!found.length) {
        this.plManager.unselectPlaylist();
      }
    }
  }

  private load(showLoader = true) {

    let loader;
    if (showLoader) {
      loader = this.loadingCtrl.create({
        spinner: 'crescent',
        content: this.search ? 'Searching ...' : 'Loading ...'
      });

      loader.present();
    }

    return this.repo.list(this.limit, this.offset, this.search, this.provider)
      .then(data => {
        console.info('DownloadedPage.data', data);
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
        loader && loader.dismiss();
        this.ref.detectChanges();
      });
  }

  private removeItem(item: Medium) {
    return this.repo.remove(item)
      .then(number => {
        let index = this.list.indexOf(item);
        if (index > -1) {
          this.list.splice(index, 1);
        }
        return number;
      });
  }
}
