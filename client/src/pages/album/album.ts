import {Component, Input, Optional, ViewChild} from "@angular/core";
import {Album} from "../../models/album";
import {PlayerService} from "../../services/PlayerService";
import {Content, NavParams} from "ionic-angular";
import {MediaManagerService} from "../../services/MediaManagerService";
import {ElementReference} from "../../models/ElementReference";
import {Medium} from "../../models/medium";
import {Playlist} from "../../models/playlist";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";

@Component({
  selector: 'album-page',
  templateUrl: 'album.html'
})
export class AlbumPage {
  @Input()
  album: Album;

  @Input()
  playlist: Playlist;

  @ViewChild('fixed') fixed: ElementReference<HTMLDivElement>;

  @ViewChild('content') content: Content;

  private autoplay = false;

  constructor(
    public player: PlayerService,
    public mediaManager: MediaManagerService,
    public plManager: PlaylistsManagerService,
    @Optional() params: NavParams = null) {
    if (params) {
      if (params.data.album) {
        this.album = params.data.album;
      }
      if (params.data.play) {
        this.autoplay = params.data.play;
      }
      this.playlist = params.data.playlist;
    }
  }

  ngAfterViewInit() {
    if (!this.album.media) {
      this.mediaManager.getByAlbum(this.album)
        .then(media => {
          this.album.media = media;
          if (!this.playlist) {
            this.player.setMedia(media);
            if (this.autoplay) {
              this.player.togglePlayItem();
            }
          }
        });
    }
    else {
      if (!this.playlist) {
        this.player.setMedia(this.album.media);
        if (this.autoplay) {
          this.player.togglePlayItem();
        }
      }
    }
  }
}