import {
  Component, Input, Optional
} from "@angular/core";
import {Medium} from "../../models/medium";
import {NavController, NavParams} from "ionic-angular";
import {PlayerService} from "../../services/PlayerService";
import {MediaManagerService} from "../../services/MediaManagerService";

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

  private autoplay: boolean;

  private current: Medium;

  constructor(
    public mediaManager: MediaManagerService,
    public player: PlayerService,
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
    }
  }

  ionViewDidEnter() {
    this.prepare();

  }

  private prepare() {
    if (this.media) {
      this.player.setMedia(this.media);

      if (this.autoplay) {
        this.player.playItem(this.media[0]);
      }

    }
  }

  play(item?: Medium) {
    if (!item) {
      if (this.current) {
        item = this.current;
      }
      else {
        item = this.media[0];
        this.current = item;
      }
    }
    else {
      this.current = item;
    }

    this.player.playItem(item);
  }

  pause() {
    this.player.pause();
  }

  isPlaying() {
    return this.player.isPlaying(this.current);
  }
}
