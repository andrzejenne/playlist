import {Injectable} from "@angular/core";
import {ServerManagerService} from "./ServerManagerService";
import {Medium} from "../models/medium";
import {MediaFile} from "../models/media-file";
import {MediaRepository} from "../repositories/media.repository";
import {Album} from "../models/album";
import {Artist} from "../models/artist";
import {Genre} from "../models/genre";
import {AppRepository} from "../repositories/app.repository";

@Injectable()
export class MediaManagerService {

  constructor(
    private serverManager: ServerManagerService,
    private repo: MediaRepository,
    private appRepo: AppRepository
  ) {

  }

  getByProvider(provider: string) {
    return this.repo.getByProvider(provider);
  }

  getByAlbum(album: Album) {
    return this.repo.getByAlbum(album.id);
  }

  getByArtist(artist: Artist) {
    return this.repo.getByArtist(artist.id);
  }

  getByGenre(genre: Genre) {
    return this.repo.getByGenre(genre.id);
  }

  hasVideo(item: Medium) {
    let file = this.getFile(item, 'video');

    return file && file.type.slug == 'video';
  }

  hasAudio(item: Medium) {
    let file = this.getFile(item, 'audio');

    return file && file.type.slug == 'audio';
  }

  getFile(item: Medium, type: string) {
    let files = item.files.filter(file => file.type.slug == type);

    if (files.length) {
      return files[0];
    }

    return null;
  }

  getFileOrDefault(item: Medium, type: string) {
    let file = this.getFile(item, type);
    if (!file) {
      return this.getFile(item, 'video');
    }

    return file;
  }

  getUrl(item: Medium, type: string, host = this.serverManager.host) {
    let file = this.getFile(item, type);
    if (!file && type != 'video') {
      file = this.getFile(item, 'video');
    }

    if (file) {
      return this.getFileUrl(item, file, host);
    }

    return null;
  }

  getFileUrl(item: Medium, file: MediaFile, host = this.serverManager.host, type = 'media') {
    return this.serverManager.getServerUrl(host) + '/' + type + '/' + item.id + '/' + file.id;
  }

  getThumbnailUrl(item: Medium, host = this.serverManager.host, fit = '80x80') {
    let thumb = MediaManagerService.getThumbnail(item);
    if (thumb) {
      return this.getFileUrl(item, thumb, host, 'thumbnails') + '/?fit=' + fit;
    }

    return 'assets/imgs/thumbnail.png';
  }

  getCoverUrl(album: Album, type = 'front', host = this.serverManager.host, fit = '80x80') {
    if (album.covers) {
      let cover = album.covers.filter(cover => cover.type.slug === type)[0] || null;
      if (cover) {
        return this.serverManager.getServerUrl(host) + '/covers/' + cover.id + '/?fit=' + fit;
      }
    }

    return 'assets/imgs/cover.png';
  }

  getArtistThumbnailUrl(artist: Artist, host = this.serverManager.host) {
    return 'assets/imgs/artist.png'; // @todo - add artists image support
  }

  getProviders() {
    return this.serverManager.getProviders();
  }

  getMediumProvider(medium: Medium) {
    return this.serverManager.getProviderBySlug(medium.provider.slug);
  }

  canDelete(medium: Medium) {
    return this.getMediumProvider(medium).delete === true;
  }

  static getThumbnail(item: Medium) {
    for (let i = 0; i < item.files.length; i++) {
      if ('thumbnail' === item.files[i].type.slug) {
        return item.files[i];
      }
    }

    return null;
  }
}
