import {ChangeDetectorRef, Component, OnDestroy, ViewChild} from '@angular/core';
import {Content, NavController, Platform} from 'ionic-angular';
import {DownloadedRepository} from "../../repositories/downloaded.repository";
import {Medium} from "../../models/medium";
import {PlaylistsRepository} from "../../repositories/playlists.repository";
import {MediaFile} from "../../models/media-file";
import {ErrorReporting} from "../../services/ErrorReporting";
import {Subscription} from "rxjs/Subscription";
import {ServerManagerService} from "../../services/ServerManagerService";
import {User} from "../../models/user";
import {AuthService} from "../../services/AuthService";
import {SelectorService} from "../../services/SelectorService";
import {ElementReference} from "../../models/ElementReference";

@Component({
  selector: 'page-downloaded',
  templateUrl: 'downloaded.html',
  providers: [SelectorService]
})
export class DownloadedPage implements OnDestroy {
  public downloaded: Medium[];

  public list: Medium[];

  public subs: Subscription[] = [];

  public player = false;

  public search = '';

  public tools: boolean;

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

  constructor(
    public navCtrl: NavController,
    public selector: SelectorService<Medium>,
    private repo: DownloadedRepository,
    private plRepo: PlaylistsRepository,
    private auth: AuthService,
    private errorReporter: ErrorReporting,
    // private modalController: ModalController,
    private servers: ServerManagerService,
    private platform: Platform,
    private ref: ChangeDetectorRef
  ) {

  }

  ionViewDidLoad() {
    this.auth.getUser()
      .then(user => this.user = user);

    this.repo.list()
      .then(data => {
        this.downloaded = data;
        this.list = [].concat(data);
        this.ref.detectChanges();
      })
      .catch(this.errorReporter.report);

    this.initPlayer();
  }

  addToPlaylist(item: Medium) {
    this.plRepo.addToPlaylist(item)
      .then(result => result);
// .then(
    // @todo - info, added to playlist
  }

  getThumbnail(item: Medium) {
    for (let i = 0; i < item.files.length; i++) {
      if ('thumbnail' === item.files[i].type.slug) {
        return item.files[i];
      }
    }

    return null;
  }

  getThumbnailUrl(item: Medium) {
    let thumb = this.getThumbnail(item);
    if (thumb) {
      return this.servers.getFileUrl(item, thumb) + '?get';
    }

    return null;
  }

  getUrl(item: Medium, file: MediaFile) {
    return this.servers.getFileUrl(item, file);
  }

  playVideo(item: Medium) {
    this.player = true;

    this.videoPlayer.nativeElement.src = this.servers.getUrl(item, 'video');
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

  hasVideo(item: Medium) {
    let file = this.servers.getFile(item, 'video');

    return file && file.type.slug == 'video';
  }

  hasAudio(item: Medium) {
    let file = this.servers.getFile(item, 'audio');

    return file && file.type.slug == 'audio';
  }


  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  isLandscape = () => this.platform.isLandscape();

  filter() {
    if (this.search) {
      this.list = this.downloaded.filter(item => {
        return item && item.name && item.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      });
    }
    else {
      this.list = [].concat(this.downloaded);
    }
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
