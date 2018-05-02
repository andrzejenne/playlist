import {ChangeDetectorRef, Component, OnDestroy, ViewChild} from '@angular/core';
import {Content, NavController, Platform} from 'ionic-angular';
import {Playlist} from "../../models/playlist";
import {DownloadedRepository} from "../../repositories/downloaded.repository";
import {Medium} from "../../models/medium";
import {PlaylistsRepository} from "../../repositories/playlists.repository";
import {MediaFile} from "../../models/media-file";
import {ErrorReporting} from "../../services/ErrorReporting";
import {Subscription} from "rxjs/Subscription";
import {ServerManagerService} from "../../services/ServerManagerService";
import {User} from "../../models/user";
import {AuthService} from "../../services/AuthService";

@Component({
  selector: 'page-downloaded',
  templateUrl: 'downloaded.html'
})
export class DownloadedPage implements OnDestroy {
  public downloaded: any;

  public subs: Subscription[] = [];

  public player = false;

  @ViewChild('content') contentContainer: Content;

  public video: {
    src: string;
    type: string;
    thumbnail: string;
    title: string;
    height: number;
  };

  private user: User;

  constructor(
    public navCtrl: NavController,
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
        this.ref.detectChanges();
      })
      .catch(this.errorReporter.report);
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
    this.video = {
      src: this.servers.getUrl(item, 'video'),
      thumbnail: this.servers.getUrl(item, 'thumbnail') + '?get',
      type: 'video/mp4',
      title: item.name,
      height: this.contentContainer.getContentDimensions().contentHeight / 2
    };

    this.ref.detectChanges();
    // let data = {
    //   src: this.servers.getUrl(item, 'video'),
    //   thumbnail: this.servers.getUrl(item, 'thumbnail')+'?get',
    //   type: 'video/mp4',
    //   title: item.name,
    //   width: 600// @todo - getter
    // };
    // this.modalController.create(VideoPlayerComponent, data).present();
  }

  closeVideo() {
    this.player = false;
    this.video = null;
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

}
