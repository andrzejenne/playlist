import {Component, Input, Optional, ViewChild} from "@angular/core";
import {PlayerService} from "../../services/PlayerService";
import {Content, LoadingController, NavController, NavParams} from "ionic-angular";
import {MediaManagerService} from "../../services/MediaManagerService";
import {ElementReference} from "../../models/ElementReference";
import {Artist} from "../../models/artist";
import {Album} from "../../models/album";
import {AlbumPage} from "../album/album";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";
import {Playlist} from "../../models/playlist";

@Component({
  selector: 'artist-page',
  templateUrl: 'artist.html'
})
export class ArtistPage {
  @Input()
  artist: Artist;

  @Input()
  playlist: Playlist;

  @ViewChild('fixed') fixed: ElementReference<HTMLDivElement>;

  @ViewChild('content') content: Content;

  constructor(
    public player: PlayerService,
    public mediaManager: MediaManagerService,
    public plManager: PlaylistsManagerService,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    @Optional() params: NavParams = null) {
    if (params) {
      if (params.data.artist) {
        this.artist = params.data.artist;
      }

      this.playlist = params.data.playlist;
    }
  }

  ngAfterViewInit() {
    if (!this.artist.media) {
      let loading = this.loadingCtrl.create({
        spinner: 'crescent',
        content: 'Loading ...'
      });

      loading.present();

      this.mediaManager.getByArtist(this.artist)
        .then(media => {
          this.artist.media = media;
          if (!this.playlist) {
            this.player.setMedia(media);
          }

          loading.dismiss();
        });
    }
    else {
      if (!this.playlist) {
        if (!this.playlist) {
          this.player.setMedia(this.artist.media);
        }
      }
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
    this.navCtrl.push(AlbumPage, {
      album: album,
      playlist: this.playlist
    });
  }
}