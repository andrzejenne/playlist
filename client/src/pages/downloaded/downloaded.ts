import {ChangeDetectorRef, Component, OnDestroy, ViewChild} from '@angular/core';
import {Content, NavController, NavParams, Platform} from 'ionic-angular';
import {DownloadedRepository} from "../../repositories/downloaded.repository";
import {Medium} from "../../models/medium";
import {ErrorReporting} from "../../services/ErrorReporting";
import {Subscription} from "rxjs/Subscription";
import {User} from "../../models/user";
import {AuthService} from "../../services/AuthService";
import {SelectorService} from "../../services/SelectorService";
import {ElementReference} from "../../models/ElementReference";
import {MediaManagerService} from "../../services/MediaManagerService";
import {ConfigService} from "../../services/ConfigService";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";
import {Playlist} from "../../models/playlist";

@Component({
  selector: 'page-downloaded',
  templateUrl: 'downloaded.html',
  providers: [SelectorService]
})
export class DownloadedPage implements OnDestroy {
  public downloaded: Medium[];

  public list: Medium[];

  public player = false;

  public search = '';

  public tools: boolean;

  public playlist: Playlist;

  @ViewChild('content') contentContainer: Content;

  @ViewChild('videoPlayer') videoPlayer: ElementReference<HTMLVideoElement>;

  video: {
    width?: number;
    height?: number;
    containerStyle?: any;
  } = {
    width: 0,
    height: 0,
    containerStyle: {width: '100%'}
  };

  private user: User;

  private subs: Subscription[] = [];

  private limit = 30;

  private offset = 0;

  private end = false;

  constructor(
    public navCtrl: NavController,
    public selector: SelectorService<Medium>,
    public mediaManager: MediaManagerService,
    public platform: Platform,
    private repo: DownloadedRepository,
    private plManager: PlaylistsManagerService,
    private auth: AuthService,
    private errorReporter: ErrorReporting,
    // private modalController: ModalController,
    private config: ConfigService,
    private ref: ChangeDetectorRef,
    private params: NavParams
  ) {
    if (params.data.id) {
      this.playlist = params.data;
    }
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
      )
    );

    this.load();

    this.initPlayer();
  }

  private load() {
    return this.repo.list(this.limit, this.offset, this.search)
      .then(data => {
        console.info('DownloadedPage.data', data);
        if (data.length != this.limit) {
          this.end = true;
        }
        if (this.offset) {
          this.downloaded = this.downloaded.concat(data);
          this.list = [].concat(this.downloaded);
          this.ref.detectChanges();
        }
        else {
          this.downloaded = data;
          this.list = [].concat(data);
        }
        this.ref.detectChanges();
      })
      .catch(this.errorReporter.report);

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

  addToPlaylist(item: Medium) {
    this.plManager.addToPlaylist(item, this.playlist)
      .then(result => result);
// .then(
    // @todo - info, added to playlist
  }

  playMedia(item: Medium) {
    this.player = true;

    this.videoPlayer.nativeElement.src = this.mediaManager.getUrl(item, 'video');
    this.videoPlayer.nativeElement.play();

    this.ref.detectChanges();
    // let data = {
    //   src: this.servers.getUrl(item, 'video'),
    //   thumbnail: this.servers.getUrl(item, 'thumbnail')+'?get',
    //   type: 'video/mp4',
    //   title: item.name,
    //   width: 600// @todo - getter
    // };
    // this.modalController.create(VideoPlayerComponent, data).present();
    this.setContentMarginIfVideo();
  }

  closeVideo() {
    this.player = false;
    this.video = {};
    this.removeContentMargin();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
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

  private initPlayer() {
    this.videoPlayer.nativeElement.onended = this.onPlayerPlayEnded;
    this.videoPlayer.nativeElement.onloadedmetadata = this.onPlayerMetadata;
    // this.audioPlayer.nativeElement.onended = this.onPlayerPlayEnded;
  }

  private onPlayerPlayEnded = (ev: MediaStreamErrorEvent) => {
    this.closeVideo();
  };

  private onPlayerMetadata = (ev: MediaStreamErrorEvent) => {
    console.info('loadedMetaData', ev, this.videoPlayer.nativeElement.videoWidth, this.videoPlayer.nativeElement.videoHeight, this.contentContainer.contentWidth, this.contentContainer.contentHeight);
    let player = this.videoPlayer.nativeElement;
    let aspect = player.videoWidth / player.videoHeight;
    this.video.width = Math.min(player.videoWidth, this.contentContainer.contentWidth);
    this.video.height = this.video.width / aspect;

    let contentHeight = this.contentContainer.contentHeight;
    let halfHeight = contentHeight / 2;
    if (this.video.height > halfHeight) {
      this.video.height = halfHeight;
      this.video.width = aspect * this.video.height;
    }

    this.video.containerStyle = {width: '100%', height: this.video.height + "px"};

    this.setContentMarginIfVideo();

    this.ref.detectChanges();
  };

  private setContentMarginIfVideo() {
    if (this.video.height) {
      this.contentContainer.getScrollElement().style.marginTop = (this.video.height + this.contentContainer._hdrHeight) + 'px';
    }
  }

  private removeContentMargin() {
    // this.contentContainer.resize();
    this.contentContainer.getScrollElement().style.marginTop = (this.contentContainer._hdrHeight) + 'px';
  }
}
