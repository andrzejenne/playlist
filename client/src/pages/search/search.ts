import {ChangeDetectorRef, Component, OnDestroy, Optional, ViewChild} from '@angular/core';
import {LoadingController, Modal, ModalController, NavController, NavParams, Platform, TextInput} from 'ionic-angular';
import {SearchRepository} from "../../repositories/search.repository";
import {SearchItem} from "../../models/search-item";
import {Search} from "../../models/search";
import {AuthService} from "../../services/AuthService";
import {DownloadManager} from "../../services/DownloadManager";
import {DownloadQueueComponent} from "../../components/download-queue/download-queue.component";
import {Subscription} from "rxjs/Subscription";
import {ConfigService} from "../../services/ConfigService";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";
import {Playlist} from "../../models/playlist";

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage implements OnDestroy {

  search: string;

  history: Search[] = [];

  list: SearchItem[] = [];

  focused = false;

  nextPageToken: string;

  prevPageToken: string;

  downloaderColor = 'default';

  downloaderModal: Modal;

  @ViewChild('input')
  input: TextInput;

  searching = false;

  playlist: Playlist;

  private allHistory: Search[];

  private userId: number;

  private subs: Subscription[] = [];

  constructor(
    public navCtrl: NavController,
    private repo: SearchRepository,
    private auth: AuthService,
    private downloadManager: DownloadManager,
    private plManager: PlaylistsManagerService,
    // private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private config: ConfigService,
    private platform: Platform,
    private ref: ChangeDetectorRef,
    @Optional() params: NavParams
  ) {
    if (params) {
      if (params.data.playlist) {
        this.playlist = params.data.playlist;
      }
    }
  }

  ionViewDidLoad() {
    this.subs.push(
      this.config.settings$.subscribe(settings => {
        if (settings && settings.server) {
          this.auth.getUser(settings.server)
            .then(user => this.userId = user.id);
        }
      })
    );

    this.subs.push(
      this.downloadManager.onChange(changes => {
        // @todo - fix
        if (this.downloadManager.downloads) {
          this.downloaderColor = 'primary';
          if (this.downloadManager.finished.length >= this.downloadManager.downloads.length) {
            this.downloaderColor = 'secondary';
          }
          this.ref.detectChanges();
        }
      })
    );
  }

  public openDownloadQueue() {
    if (!this.downloaderModal) {
      this.downloaderModal = this.modalCtrl.create(DownloadQueueComponent);
    }

    this.downloaderModal.present();
  }

  public onSearchClick() {
    console.info('onSearchClick');
    this.searchItems();
  }

  public onNextClick() {
    this.searchItems(null, {pageToken: this.nextPageToken})
  }

  public onPrevClick() {
    this.searchItems(null, {pageToken: this.prevPageToken})
  }

  public doInfinite(infiniteScroll) {
    this.repo.search(this.userId, this.search, {pageToken: this.nextPageToken})
      .then(response => {
        this.list = this.list.concat(response.items);
        console.info('response', response);
        this.nextPageToken = response.next;
        this.prevPageToken = response.prev;
        this.ref.detectChanges();
        infiniteScroll.complete();
      });
  }

  public getSearchHistory() {
    console.info('getSearchHistory');

    this.repo.getSearchHistory(this.userId)
      .then(response => {
        this.allHistory = response;
        this.filterHistory();
        this.ref.detectChanges();
      });
  }

  public removeSearchHistory(event: MouseEvent, item: Search) {
    event.preventDefault();
    event.stopPropagation();

    this.repo.removeSearchHistory(item.id)
      .then(response => {
        this.removeSearchHistoryItem(item);
        this.ref.detectChanges();
      });
  }

  public getInfo(event: MouseEvent, item: SearchItem) {
    this.repo.getInfo(item.sid)
      .then(response => console.info(response))
  }

  public download(event: MouseEvent, item: SearchItem) {
    this.downloadManager.download(this.userId, item, 'youtube');
  }

  public toPlaylist(event: MouseEvent, item: SearchItem) {
    this.downloadManager.downloadToPlaylist(this.userId, item, this.plManager.playlist, 'youtube');
  }

  public searchItems(query?: string, args?: any) {
    console.info('searchItems');

    if (query) {
      this.search = query;
    }

    this.history = [];

    args = args || {};
    args.perPage = 16;

    if (this.search && this.search.length) {
      let loader = this.loadingCtrl.create({
        spinner: 'crescent',
        content: 'Searching ...'
      });

      loader.present();

      this.repo.search(this.userId, this.search, args)
        .then(response => {
          this.list = response.items;
          console.info('response', response);
          this.nextPageToken = response.next;
          this.prevPageToken = response.prev;
          loader.dismiss();

          this.ref.detectChanges();
        });

    }
    else {
      this.list = [];
      this.ref.detectChanges();
    }
  }

  clearSearch() {
    this.search = '';
    this.list = [];
    // @todo - not working ?
    this.input.initFocus();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  isLandscape() {
    return this.platform.isLandscape();
  }

  openSearchHistory(event: UIEvent, item: Search) {
    this.input.setValue(item.query);
    this.input.setFocus();

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  private filterHistory() {
    if (this.search) {
      this.history = this.allHistory.filter(item => -1 !== item.query.indexOf(this.search));
    }
    else {
      this.history = [].concat(this.allHistory);
    }
  }

  private removeSearchHistoryItem(item: Search) {
    let ia = this.allHistory.indexOf(item);
    let i = this.history.indexOf(item);
    if (-1 != ia) {
      this.allHistory.splice(ia, 1);
    }
    if (-1 != i) {
      this.history.splice(i, 1);
    }
  }
}
