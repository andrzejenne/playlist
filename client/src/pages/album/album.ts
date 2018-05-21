import {Component, Input, Optional, ViewChild} from "@angular/core";
import {Album} from "../../models/album";
import {PlayerService} from "../../services/PlayerService";
import {Content, NavParams} from "ionic-angular";
import {MediaManagerService} from "../../services/MediaManagerService";
import {ElementReference} from "../../models/ElementReference";

@Component({
  selector: 'album-page',
  templateUrl: 'album.html'
})
export class AlbumPage {
  @Input()
  album: Album;

  @ViewChild('fixed') fixed: ElementReference<HTMLDivElement>;

  @ViewChild('content') content: Content;

  constructor(
    public player: PlayerService,
    public mediaManager: MediaManagerService,
    @Optional() params: NavParams = null) {
    if (params) {
      if (params.data.album) {
        this.album = params.data.album;
      }
    }
  }

  ngAfterViewInit() {
    if (!this.album.media) {
      this.mediaManager.getByAlbum(this.album)
        .then(media => {
          this.album.media = media;
          this.player.setMedia(media);
        });
    }
  }
}