import {ChangeDetectorRef, Component} from '@angular/core';
import {MediaManagerService} from "../../services/MediaManagerService";
import {Medium} from "../../models/medium";
import {SelectorService} from "../../services/SelectorService";
import {NavParams, Platform, ViewController} from "ionic-angular";
import {Playlist} from "../../models/playlist";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";

@Component({
  selector: 'page-youtube',
  templateUrl: 'youtube.html',
  providers: [
    SelectorService
  ]
})
export class YouTubePage {

  media: Medium[] = [];

  playlist: Playlist;

  constructor(
    public platform: Platform,
    public selector: SelectorService<Medium>,
    private mediaManager: MediaManagerService,
    private plManager: PlaylistsManagerService,
    private ref: ChangeDetectorRef,
    private params: NavParams,
    private viewCtrl: ViewController
  ) {
    if (params.data.id) {
      this.playlist = params.data;
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {
    this.mediaManager.getByProvider('youtube')
      .then(
        media => (this.media = media) && this.ref.detectChanges()
      );
  }

  addToPlaylist(item: Medium) {
    this.plManager.addToPlaylist(item, this.playlist);
  }
}
