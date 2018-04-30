import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {Modal, ModalController, NavController, Platform} from 'ionic-angular';
import {SearchRepository} from "../../repositories/search.repository";
import {SearchItem} from "../../models/search-item";
import {Search} from "../../models/search";
import {AuthService} from "../../services/AuthService";
import {DownloadManager} from "../../services/DownloadManager";
import {DownloadQueueComponent} from "../../components/download-queue/download-queue.component";
import {PlaylistsRepository} from "../../repositories/playlists.repository";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage implements OnDestroy {

  public search: string;

  public history: Search[] = [];

  public list: SearchItem[] = [];

  public focused = false;

  public nextPageToken: string;

  public prevPageToken: string;

  downloaderColor = 'default';

  downloaderModal: Modal;

  private allHistory: Search[];

  private userId: number;

  private subs: Subscription[] = [];

  constructor(
    public navCtrl: NavController,
    private repo: SearchRepository,
    private auth: AuthService,
    private downloadManager: DownloadManager,
    private playlistRepository: PlaylistsRepository,
    // private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private platform: Platform,
    private ref: ChangeDetectorRef
  ) {

  }

  ionViewDidLoad() {
    this.auth.getUser()
      .then(user => this.userId = user.id);

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
    this.downloadManager.downloadToPlaylist(this.userId, item, this.playlistRepository.playlist, 'youtube');
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
      this.repo.search(this.userId, this.search, args)
        .then(response => {
          this.list = response.items;
          console.info('response', response);
          this.nextPageToken = response.next;
          this.prevPageToken = response.prev;
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
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  isLandscape() {
    return this.platform.isLandscape();
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
