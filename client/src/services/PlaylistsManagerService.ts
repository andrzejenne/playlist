import {Injectable} from "@angular/core";
import {PlaylistsRepository} from "../repositories/playlists.repository";
import {User} from "../models/user";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Playlist} from "../models/playlist";
import {Medium} from "../models/medium";

@Injectable()
export class PlaylistsManagerService {

  playlist: Playlist;

  playlists: Playlist[];

  playlists$ = new BehaviorSubject<Playlist[]>([]);

  playlist$ = new BehaviorSubject<Playlist>(null);

  constructor(private repo: PlaylistsRepository) {

  }

  list(user: User) {
    return this.repo.list(user.id).then(playlists => {
      this.playlists = playlists;
      this.playlists$.next(this.playlists);

      return playlists;
    });
  }

  remove(playlist: Playlist) {
    return this.repo.remove(playlist.id)
      .then(num => {
        let index = this.playlists.indexOf(playlist);
        if (index > -1) {
          this.playlists.splice(index, 1);
          this.playlists$.next(this.playlists);

          return num;
        }
      });
  }

  create(user: User, name: string) {
    return this.repo.create(user.id, name)
      .then(playlist => {
        this.playlist = playlist;
        this.playlist$.next(this.playlist);
        this.playlists.push(this.playlist);
        this.playlists$.next(this.playlists);

        return playlist;
      });
  }

  addToPlaylist(item: Medium, playlist: Playlist) {
    return this.repo.addToPlaylist(item.id, playlist.id).then(medium => {
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

  addToPlaylistBySid(sid: string, playlist: Playlist) {
    return this.repo.getMediaBySid(sid).then(medium => {
      return this.addToPlaylist(medium, playlist);
    });
  }

  removeFromPlaylist(item: Medium, playlist: Playlist) {
    return this.repo.removeFromPlaylist(item.id, playlist.id)
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

  getPlaylists(user: User, defaultId = null) {
    this.list(user)
      .then(data => {
        this.playlists = data;

        // debugger;

        if (data.length) {
          if (defaultId !== null) {
            let playlists = data.filter(playlist => playlist.id === defaultId);
            if (playlists.length) {
              this.selectPlaylist(playlists[0]);
            }
          }
          else {
            this.selectPlaylist(data[0]);
          }
        }
        else {
          this.create(user, 'default')
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

    return this.playlists;
  }

  selectPlaylist(playlist: Playlist) {
    if (!this.playlist || this.playlist.id != playlist.id) {
      this.playlist = playlist;

      // console.info('select playlist', playlist);
      this.playlist$.next(playlist);

      console.info('selected', playlist);

      return this.repo.load(playlist.id)
        .then(media => {
          playlist.media = media;
          this.playlist$.next(playlist);
        });

    }
    else {
      return new Promise((resolve, reject) => resolve(playlist));
    }
  }

  clearPlaylists() {
    this.playlists = [];
    this.playlist = null;
    this.playlist$.next(null);
    this.playlists$.next([]);
  }
}
