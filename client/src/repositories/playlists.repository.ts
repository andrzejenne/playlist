import {Injectable} from '@angular/core';
import {WampRepository} from "./wamp.repository";
import {Playlist} from "../models/playlist";
import {Medium} from "../models/medium";

@Injectable()
export class PlaylistsRepository extends WampRepository {

  public list(uid: number) {
    return this.call<Playlist[]>('com.playlists.list', [{uid: uid}]);
  }


  public load(playlistId: number) {
    return this.call<Medium[]>('com.playlists.media', [{pid: playlistId}]);
  }

  public remove(playlistId: number) {
    return this.call<Medium[]>('com.playlists.remove', [{pid: playlistId}]);
  }

  public create(uid: number, name: string) {
    return this.call<Playlist>('com.playlists.create', [{uid: uid, name: name}]);
  }

  public addToPlaylist(itemId: number, playlistId: number) {
    return this.call<Medium>('com.playlists.addMedium', [{pid: playlistId, mid: itemId}]);
  }

  public getMediaBySid(sid: string) {
    return this.call<Medium>('com.media.getBySid', [{sid: sid}]);
  }

  public removeFromPlaylist(itemId: number, playlistId: number) {
    return this.call<number>('com.playlists.removeMedium', [{pid: playlistId, mid: itemId}]);
  }

}
