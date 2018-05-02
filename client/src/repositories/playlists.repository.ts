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
    return this.call<Playlist[]>('com.playlists.list', [{uid: uid}])
      .then(playlists => {
        this.playlists = playlists;
        this.playlists$.next(this.playlists);

        return playlists;
      });
  }


  public load(playlist: Playlist) {
    return this.call<Medium[]>('com.playlists.media', [{pid: playlist.id}]);
  }

  public create(uid: number, name: string) {
    return this.call<Playlist>('com.playlists.create', [{uid: uid, name: name}])
      .then(playlist => {
        this.playlist = playlist;
        this.playlist$.next(this.playlist);
        this.playlists.push(this.playlist);
        this.playlists$.next(this.playlists);

        return playlist;
      });
  }

  public addToPlaylist(item: Medium, playlist = this.playlist) {
    return this.call<Medium>('com.playlists.add', [{pid: playlist.id, mid: item.id}])
      .then(medium => {
        if (!playlist.media) {
          playlist.media = [];
        }
        playlist.media.push(medium);

        this.playlists$.next(this.playlists);

        if (playlist === this.playlist) {
          this.playlist$.next(playlist);
        }

        return medium;
      });
  }

  public addToPlaylistBySid(sid: string, playlist = this.playlist) {
    return this.call<Medium>('com.media.getBySid', [{sid: sid}])
      .then(medium => {
        return this.addToPlaylist(medium, playlist);
      });
  }

  public removeFromPlaylist(item: Medium, playlist = this.playlist) {
    return this.call<number>('com.playlists.remove', [{pid: playlist.id, mid: item.id}])
      .then(number => {
        let index = playlist.media.indexOf(item);
        if (index > -1) {
          playlist.media.splice(index, 1);
        }

        this.playlists$.next(this.playlists);

        if (playlist === this.playlist) {
          this.playlist$.next(playlist);
        }

        return number;
      });
  }

  getPlaylists(uid: number) {
    if (!this.playlists) {
      this.list(uid)
        .then(data => {
          this.playlists = data;

          // debugger;

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
    if (!this.playlist || this.playlist.id != playlist.id) {
      this.playlist = playlist;

      // console.info('select playlist', playlist);
      this.playlist$.next(playlist);

      console.info('selected', playlist);

      return this.load(playlist)
        .then(media => {
          playlist.media = media;
          this.playlist$.next(playlist);
        });

    }
    else {
      return new Promise((resolve, reject) => resolve(playlist));
    }
  }

}
