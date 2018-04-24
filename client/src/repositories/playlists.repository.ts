import {Injectable} from '@angular/core';
import {WampRepository} from "./wamp.repository";
import {Playlist} from "../models/playlist";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Medium} from "../models/medium";

@Injectable()
export class PlaylistsRepository extends WampRepository {
  playlist: Playlist;

  playlists: Playlist[];

  playlists$ = new BehaviorSubject<Playlist[]>([]);

  playlist$ = new BehaviorSubject<Playlist>(null);

  public list(uid: number) {
    return this.call<Playlist[]>('com.playlists.list', [{uid: uid}]);
  }

  public load(playlist: Playlist) {
    return this.call<any[]>('com.playlists.media', [{pid: playlist.id}]);
  }

  public create(uid: number, name: string) {
    return this.call<Playlist>('com.playlists.create', [{uid: uid, name: name}]);
  }

  public addToPlaylist(item: Medium, playlist = this.playlist) {
    return this.call<any>('com.playlists.add', [{pid: playlist.id, mid: item.id}]);
  }

  getPlaylists(uid: number) {
    if (!this.playlists) {
      this.list(uid)
        .then(data => {
          this.playlists = data;

          if (data.length) {
            this.selectPlaylist(data[0]);
          }
          else {
            this.create(uid, 'default')
              .then(playlist => {
                this.playlists.push(playlist);
                this.playlists$.next(this.playlists);
                this.selectPlaylist(playlist);
              })
              .catch(error => console.error(error));
          }

          this.playlists$.next(data);
        })
        .catch(error => console.error(error));
    }

    return this.playlists;
  }

  selectPlaylist(playlist: Playlist) {
    this.playlist = playlist;

    console.info('select playlist', playlist);
    this.playlist$.next(playlist);
  }

}
