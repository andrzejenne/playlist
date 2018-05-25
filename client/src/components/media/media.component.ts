import {
  Component, Input, Optional
} from "@angular/core";
import {Medium} from "../../models/medium";
import {NavController, NavParams} from "ionic-angular";
import {PlayerService} from "../../services/PlayerService";
import {MediaManagerService} from "../../services/MediaManagerService";
import {Playlist} from "../../models/playlist";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";

@Component({
  selector: 'media-component',
  templateUrl: 'media.component.html',
})
export class MediaComponent {
  @Input()
  media: Medium[];

  @Input()
  title: string;

  @Input()
  compact: boolean;

  @Input()
  playlist: Playlist;

  private autoplay: boolean;

  constructor(
    public mediaManager: MediaManagerService,
    public player: PlayerService,
    public plManager: PlaylistsManagerService,
    @Optional() public nav: NavController = null,
    @Optional() params: NavParams = null
  ) {
    if (params) {
      if (params.data.media) {
        this.media = params.data.media;
      }

      if (params.data.title) {
        this.title = params.data.title;
      }

      this.compact = params.data.compact || false;

      this.autoplay = params.data.autoplay || false;

      this.playlist = params.data.playlist;
    }
  }

  ionViewDidEnter() {
    this.prepare();
  }

  private prepare() {
    if (this.media && !this.playlist) {
      this.player.setMedia(this.media);

      if (this.autoplay) {
        this.player.togglePlayItem();
      }
    }
  }
}
