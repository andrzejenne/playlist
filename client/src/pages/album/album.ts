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

  private autoplay = false;

  private current: Medium;

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
    if (!item) {
      if (this.current) {
        item = this.current;
      }
      else {
        item = this.album.media[0];
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