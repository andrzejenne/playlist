import {Injectable} from "@angular/core";
import {PlaylistsRepository} from "../repositories/playlists.repository";
import {User} from "../models/user";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Playlist} from "../models/playlist";
import {Medium} from "../models/medium";
import {ToastController} from "ionic-angular";

@Injectable()
export class PlaylistsManagerService {

  playlist: Playlist;

  playlists: Playlist[];

  playlists$ = new BehaviorSubject<Playlist[]>([]);

  playlist$ = new BehaviorSubject<Playlist>(null);

  constructor(private repo: PlaylistsRepository,
              private toastCtrl: ToastController) {

  }

  list(user: User) {
    return this.repo.list(user.id).then(playlists => {
      PlaylistsManagerService.recalculate(playlists);
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

          this.toastCtrl.create({
            message: 'Playlist ' + playlist.name + ' removed',
            position: 'top',
            duration: 2000
          }).present();

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

        this.toastCtrl.create({
          message: 'Playlist ' + playlist.name + ' created',
          position: 'top',
          duration: 2000
        }).present();

        return playlist;
      });
  }

  addToPlaylist(item: Medium, playlist: Playlist) {
    return this.repo.addToPlaylist(item.id, playlist.id).then(medium => {
      if (!playlist.media) {
        playlist.media = [];
      }
      playlist.media.push(medium);

      PlaylistsManagerService.recalculate([playlist]);

      this.playlists$.next(this.playlists);

      if (playlist === this.playlist) {
        this.playlist$.next(playlist);
      }

      // @todo - reconsider
      this.toastCtrl.create({
        duration: 1000,
        position: 'top',
        message: 'Added ' + medium.name + ' to ' + this.playlist.name
      }).present();

      return medium;
    })
  }

  addToPlaylistBySid(sid: string, playlist: Playlist) {
    return this.repo.getMediaBySid(sid).then(medium => {
      return this.addToPlaylist(medium, playlist);
    });
  }

  inPlaylist(item: Medium, playlist = this.playlist) {
    return playlist.media.filter(medium => item.id == medium.id).length > 0;
  }

  removeFromPlaylist(item: Medium, playlist: Playlist) {
    return this.repo.removeFromPlaylist(item.id, playlist.id)
      .then(number => {
        let index = playlist.media.indexOf(item);
        if (index > -1) {
          playlist.media.splice(index, 1);
        }

        PlaylistsManagerService.recalculate([playlist]);

        this.playlists$.next(this.playlists);

        if (playlist === this.playlist) {
          this.playlist$.next(playlist);
        }

        return number;
      });
  }

  getPlaylists(user: User, defaultId = null) {
    return this.list(user)
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

          PlaylistsManagerService.recalculate(data);
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

        return data;
      })
      .catch(error => console.error(error));
  }

  toggleSelectPlaylist(playlist: Playlist) {
    if (this.playlist === playlist) {
      this.selectPlaylist(null);
    }
    else {
      this.selectPlaylist(playlist);
    }
  }

  selectPlaylist(playlist: Playlist) {
    this.playlist = playlist;

    console.info('selected', playlist);

    this.playlist$.next(playlist);

    // if (this.playlist && this.playlist.id) {
    //   return this.repo.load(this.playlist.id)
    //     .then(media => {
    //       playlist.media = media;
    //       // this.playlist$.next(playlist);
    //
    //       return media;
    //     });
    // }
    // else  {
    //   this.playlist$.next(playlist);
    // }
  }

  unselectPlaylist() {
    this.playlist = null;
    this.playlist$.next(null);
  }

  clearPlaylists() {
    this.unselectPlaylist();
    this.playlists = [];
    this.playlists$.next([]);
  }

  private static recalculate(playlists: Playlist[]) {
    playlists.forEach(playlist => {
      if (playlist.media) {
        playlist.count = playlist.media.length;
        let duration = 0;
        playlist.media.forEach(medium => duration += medium.duration);
        playlist.duration = duration;
      }
    });

    console.info('PlaylistManagerService@recalculate', playlists);
  }
}
