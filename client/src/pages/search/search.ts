import {ChangeDetectorRef, Component} from '@angular/core';
import {Modal, ModalController, NavController} from 'ionic-angular';
import {SearchRepository} from "../../repositories/search.repository";
import {SearchItem} from "../../models/search-item";
import {Search} from "../../models/search";
import {AuthService} from "../../services/AuthService";
import {DownloadManager} from "../../services/DownloadManager";
import {DownloadQueueComponent} from "../../components/download-queue/download-queue.component";
import {PlaylistsRepository} from "../../repositories/playlists.repository";

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

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

  constructor(
    public navCtrl: NavController,
    private repo: SearchRepository,
    private auth: AuthService,
    private downloadManager: DownloadManager,
    private playlistRepository: PlaylistsRepository,
    // private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private ref: ChangeDetectorRef
  ) {

  }

  ionViewDidLoad() {
    this.auth.getUser()
      .then(user => this.userId = user.id);
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

    if (this.search && this.search.length) {
      this.repo.search(this.userId, this.search, args || {})
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
