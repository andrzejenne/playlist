import {Injectable} from '@angular/core';
import {WampRepository} from "./wamp.repository";
import {Artist} from "../models/artist";
import {Album} from "../models/album";
import {Genre} from "../models/genre";

@Injectable()
export class LibraryRepository extends WampRepository {

  public artists() {
    return this.call<Artist[]>('com.library.artists', []);
  }

  public albums() {
    return this.call<Album[]>('com.library.albums', []);
  }

  public genres() {
    return this.call<Genre[]>('com.library.genres', []);
  }
}
