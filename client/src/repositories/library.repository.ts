import {Injectable} from '@angular/core';
import {WampRepository} from "./wamp.repository";
import {Artist} from "../models/artist";
import {Album} from "../models/album";
import {Genre} from "../models/genre";

@Injectable()
export class LibraryRepository extends WampRepository {

  public artists(limit: number, offset: number, search: string) {
    return this.call<Artist[]>('com.library.artists', [{limit: limit, offset: offset, search: search}]);
  }

  public albums(limit: number, offset: number, search: string) {
    return this.call<Album[]>('com.library.albums', [{limit: limit, offset: offset, search: search}]);
  }

  public genres(limit: number, offset: number, search: string) {
    return this.call<Genre[]>('com.library.genres', [{limit: limit, offset: offset, search: search}]);
  }

  public artistsCount() {
    return this.call<number>('com.library.artistsCount', []);
  }

  public albumsCount() {
    return this.call<number>('com.library.albumsCount', []);
  }

  public genresCount() {
    return this.call<number>('com.library.genresCount', []);
  }
}
