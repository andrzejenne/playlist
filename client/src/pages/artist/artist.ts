import {Component, Input, Optional, ViewChild} from "@angular/core";
import {PlayerService} from "../../services/PlayerService";
import {Content, NavController, NavParams} from "ionic-angular";
import {MediaManagerService} from "../../services/MediaManagerService";
import {ElementReference} from "../../models/ElementReference";
import {Artist} from "../../models/artist";
import {Album} from "../../models/album";
import {AlbumPage} from "../album/album";
import {Medium} from "../../models/medium";

@Component({
  selector: 'artist-page',
  templateUrl: 'artist.html'
})
export class ArtistPage {
  @Input()
  artist: Artist;

  @ViewChild('fixed') fixed: ElementReference<HTMLDivElement>;

  @ViewChild('content') content: Content;

  private current: Medium;

  constructor(
    public player: PlayerService,
    public mediaManager: MediaManagerService,
    private navCtrl: NavController,
    @Optional() params: NavParams = null) {
    if (params) {
      if (params.data.artist) {
        this.artist = params.data.artist;
      }
    }
  }

  ngAfterViewInit() {
    if (!this.artist.media) {
      this.mediaManager.getByArtist(this.artist)
        .then(media => {
          this.artist.media = media;
          this.player.setMedia(media);
        });
    }
  }

  getCover() {
    return this.mediaManager.getArtistThumbnailUrl(this.artist);
  }

  getAlbumCover(album: Album) {
    return this.mediaManager.getCoverUrl(album);
  }

  play(album: Album) {
    if (!album.media) {
      this.mediaManager.getByAlbum(album)
        .then(media => {
          album.media = media;
          this.player.setMedia(album.media).playNext();
          this.openAlbum(album)
        })
    }
    else {
      this.player.setMedia(album.media).playNext();
      this.openAlbum(album);
    }
  }

  openAlbum(album: Album) {
    this.navCtrl.push(AlbumPage, {album: album});
  }

  playItem(item?: Medium) {
    if (!item) {
      if (this.current) {
        item = this.current;
      }
      else {
        item = this.artist.media[0];
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