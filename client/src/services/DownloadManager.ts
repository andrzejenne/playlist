import {EventEmitter, Injectable} from "@angular/core";
import {WampService} from "./WampService";
import {SearchItem} from "../models/search-item";
import {DownloadItem} from "../models/download-item";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Playlist} from "../models/playlist";
import {PlaylistsManagerService} from "./PlaylistsManagerService";

@Injectable()
export class DownloadManager {

  downloads: DownloadItem[] = [];

  finished: DownloadItem[] = [];

  private finished$ = new BehaviorSubject<DownloadItem>(null);

  private iwamp: number;

  private change$ = new EventEmitter();

  constructor(private wamp: WampService, private plManager: PlaylistsManagerService) {
    this.subscribeWamp();
  }

  download(uid: number, item: SearchItem, provider: string) {
    if (!this.isDownloading(item.sid)) {
      this.downloads.push({
        ...item,
        started: false,
        finished: false,
        files: [],
        status: []
      });

      this.wamp.call('com.mediaManager.download', [{uid: uid, sid: item.sid, provider: provider}]);
    }
  }

  // @todo - optimize, dangerous recursion can occur
  downloadToPlaylist(uid: number, item: SearchItem, playlist: Playlist, provider = 'youtube') {
    let downloadItem = this.getDownloading(item.sid);
    if (downloadItem) {
      if (downloadItem.finished) {
        this.plManager.addToPlaylistBySid(item.sid, playlist);
      }
      else {
        this.finished$.subscribe(finished => {
          if (finished && finished.sid == item.sid) {
            this.plManager.addToPlaylistBySid(item.sid, playlist);
          }
        });
      }
    }
    else {
      this.download(uid, item, provider);
      this.downloadToPlaylist(uid, item, playlist, provider);
    }
  }

  onChange(callback: any) {
    return this.change$.subscribe(callback);
  }

  isFinished() {
    return this.downloads.length == this.finished.length;
  }

  private subscribeWamp() {
    this.wamp.onOpen.subscribe(() => {
      console.debug('wamp.onOpen', this.wamp);
      this.iwamp = this.wamp.register(this.wampCommands);
    });
  }

  // private unsubscribeWamp() {
  //   this.wamp.unregister(this.iwamp);
  // }

  private wampCommands = {
    subs: {
      'sub.download.started': (data) => {
        let item = this.getDownloading(data[0].url);

        item.started = true;
        this.change$.next(this.downloads);
        console.info('Download started:', data);
      },
      'sub.download.progress': (data) => {
        let file = this.getDownloadingFile(data[0].url, data[0].filename);

        file.progress = data[0].progress;
        this.change$.next(this.downloads);
        console.info('Download progress:', data);
      },
      'sub.download.finished': (data) => {
        let item = this.getDownloading(data[0].url);

        item.finished = true;
        this.change$.next(this.downloads);
        this.finished.push(item);
        this.finished$.next(item);
        console.info('Download finished:', data);
      },
      'sub.download.error': (data) => {
        let item = this.getDownloading(data[0].url);
        this.change$.next(this.downloads);
        this.finished.push(item);
        console.info('Download error:', data);
      },
      'sub.download.status': (data) => {
        let item = this.getDownloading(data[0].url);

        item.status.push(data[0].status);
        this.change$.next(this.downloads);
        console.info('Download status:', data);
      },
      'sub.download.filename': (data) => {
        let item = this.getDownloading(data[0].url);
        item.files.push({
          name: data[0].filename,
          progress: 0
        });

        this.change$.next(this.downloads);
        console.info('Download filename:', data);
      }
    }
  };

  private isDownloading(sid: string) {
    return this.getDownloading(sid) !== null;
  }

  private getDownloading(sid: string) {
    return this.downloads.find(item => item.sid === sid) || null;
  }

  private getDownloadingFile(sid: string, filename: string) {
    let item = this.getDownloading(sid);
    if (item) {
      return item.files.find(file => file.name === filename) || null;
    }

    return null;
  }
}
