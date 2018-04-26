import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {AlertController, NavController} from 'ionic-angular';
// import {AuthService} from "../../services/AuthService";
import {Playlist} from "../../models/playlist";
import {DownloadedRepository} from "../../repositories/downloaded.repository";
import {Medium} from "../../models/medium";
import {PlaylistsRepository} from "../../repositories/playlists.repository";
import {MediaFile} from "../../models/media-file";
import {ServerManagerService} from "../../services/ServerManagerService";

@Component({
  selector: 'page-downloaded',
  templateUrl: 'downloaded.html'
})
export class DownloadedPage implements OnDestroy {

  public downloaded: any;

  public playlist: Playlist;

  public playlists: Playlist[] = [];

  public serverName: string;

  constructor(
    public navCtrl: NavController,
    private repo: DownloadedRepository,
    private plRepo: PlaylistsRepository,
    // private auth: AuthService,
    public serverManager: ServerManagerService,
    private alertCtrl: AlertController,
    private ref: ChangeDetectorRef
  ) {

  }

  ionViewDidLoad() {
    this.repo.list()
      .then(data => {
        this.downloaded = data;
        this.ref.detectChanges();
      })
      .catch(error => { // @todo - error reporting service directly to repository
        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: error.message || 'error occured',
          buttons: ['Ok']
        });

        alert.present();
      });

    this.plRepo.playlists$.subscribe(playlists => {
      this.playlists = playlists;
      this.ref.detectChanges();
    });

    this.plRepo.playlist$.subscribe(playlist => {
      this.playlist = playlist;
      this.ref.detectChanges();
    });
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
      return Medium.getFileUrl(item, thumb) + '?get';
    }

    return null;
  }

  getUrl(item: Medium, file: MediaFile) {
    return Medium.getFileUrl(item, file);
  }

  ngOnDestroy(): void {
  }

}
