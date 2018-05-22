import {Injectable} from '@angular/core';
import {WampRepository} from "./wamp.repository";
import {Medium} from "../models/medium";

@Injectable()
export class MediaRepository extends WampRepository {

  public getByProvider(provider: string) {
    return this.call<Medium[]>('com.media.getByProvider', [{pSlug: provider}]);
  }

  public getByProviderId(providerId) {
    return this.call<Medium[]>('com.media.getByProvider', [{pid: providerId}]);
  }

  public getByAlbum(albumId) {
    return this.call<Medium[]>('com.media.getByAlbum', [{aid: albumId}]);
  }

  public getByArtist(artistId) {
    return this.call<Medium[]>('com.media.getByArtist', [{aid: artistId}]);
  }

  public getByGenre(genreId) {
    return this.call<Medium[]>('com.media.getByGenre', [{gid: genreId}]);
  }

}
