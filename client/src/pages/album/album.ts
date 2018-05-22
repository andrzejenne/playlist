import {Component, Input, Optional, ViewChild} from "@angular/core";
import {Album} from "../../models/album";
import {PlayerService} from "../../services/PlayerService";
import {Content, NavParams} from "ionic-angular";
import {MediaManagerService} from "../../services/MediaManagerService";
import {ElementReference} from "../../models/ElementReference";
import {Medium} from "../../models/medium";

@Component({
  selector: 'album-page',
  templateUrl: 'album.html'
})
export class AlbumPage {
  @Input()
  album: Album;

  @ViewChild('fixed') fixed: ElementReference<HTMLDivElement>;

  @ViewChild('content') content: Content;

  playing = false;

  private autoplay = false;

  constructor(
    public player: PlayerService,
    public mediaManager: MediaManagerService,
    @Optional() params: NavParams = null) {
    if (params) {
      if (params.data.album) {
        this.album = params.data.album;
      }
      if (params.data.play) {
        this.autoplay = params.data.play;
      }
    }
  }

  ngAfterViewInit() {
    if (!this.album.media) {
      this.mediaManager.getByAlbum(this.album)
        .then(media => {
          this.album.media = media;
          this.player.setMedia(media);
          if (this.autoplay) {
            this.play();
          }
        });
    }
  }

  play(item?: Medium) {
    this.player.playItem(item || this.album.media[0]);
    this.playing = true;
  }

  pause() {
    this.player.pause();
    this.playing = false;
    // @todo - watch player status for pause
  }
}