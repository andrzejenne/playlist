import {Injectable, Optional} from "@angular/core";
import {ServerManagerService} from "./ServerManagerService";
import {Platform} from "ionic-angular";
import {File} from "@ionic-native/file";
import {Playlist} from "../models/playlist";
import {Slug} from 'ng2-slugify';
import {PlaylistsManagerService} from "./PlaylistsManagerService";
import {Medium} from "../models/medium";
import {MediaFile} from "../models/media-file";
import {Network} from '@ionic-native/network';
import {HttpClient} from "@angular/common/http";
import {MediaManagerService} from "./MediaManagerService";
import {Subject} from "rxjs/Subject";

@Injectable()
export class OfflineManagerService {

  onDownloadStart = new Subject();

  onDownloadProgress = new Subject<{filename: string, progress: number}>();

  onDownloadFinish = new Subject();

  playlist: {
    [index: string]: { // host
      [index: number]: boolean // id
    }
  } = {};

  private rootDir: string;

  private dir: string;

  // private file: File;

  private ready;

  private slug = new Slug('default');

  private offlineQueue = [];

  private canDownload = false;

  private downloading = false;

  private offlineFiles: {
    [index: string]: { file: MediaFile, path: string }[]
  } = {};

  constructor(
    private servers: ServerManagerService,
    private platform: Platform,
    private plManager: PlaylistsManagerService,
    private network: Network,
    private http: HttpClient,
    private mediaManager: MediaManagerService,
    @Optional() private file: File = null
  ) {
    platform.ready()
      .then(result => this.init());
  }

  get isOffline() {
    return !this.servers.isConnected();
  }

  get enabled() {
    return this.rootDir !== null;
  }

  public makePlaylistOffline(playlist: Playlist) {
    return this.getPlaylistFilesStats(playlist)
      .then(stats => {
        let notOffline = stats.filter(stat => !stat.offline);

        if (notOffline.length > 0) {
          let slug = this.slug.slugify(playlist.name);

          this.preparePlaylistDir(playlist)
            .then(result => {
              notOffline.forEach(stat => {
                this.offlineQueue.push({
                  medium: stat.medium,
                  file: stat.file,
                  dir: slug,
                  url: this.mediaManager.getFileUrl(stat.medium, stat.file)
                });
              });
              this.startDownloading();
            })
            .catch(error => false);

        }
        else {
          return true;
        }
      });
  }

  public isPlaylistOffline(playlist: Playlist, host = this.servers.host) {
    return this.playlist[host] ? this.playlist[host][playlist.id] || false : false;
    // return this.getPlaylistFilesStats(playlist)
    //   .then(stats => stats.filter(stat => !stat.offline).length > 0)
    //   .then(offline => {
    //     console.info('Offline@isPlaylistOffline', offline);
    //     return offline;
    //   });
  }

  public getMediaFileUrl(medium: Medium, file: MediaFile) {
    if (this.offlineFiles[medium.provider_sid]) {
      let stats = this.offlineFiles[medium.provider_sid].filter(stat => stat.file.id == file.id);
      if (stats.length) {
        return stats[0].path;
      }
    }

    return null;
  }

  public clearAll() {
    this.file.checkDir(this.rootDir, this.dir)
      .then(result => {
        return this.file.removeRecursively(this.rootDir, this.dir);
      })
      .catch(error => {
        console.info('nothing for delete');
      });
  }

  private preparePlaylistDir(playlist: Playlist) {
    let slug = this.slug.slugify(playlist.name);

    return this.file.checkDir(this.rootDir + this.dir, slug)
      .then(result => true)
      .catch(error => {
        return this.file.createDir(this.rootDir + this.dir, slug, false);
      })
      .then(result => result)
      .catch(error => false);
  }


  private prepareDir() {
    return this.file.checkDir(this.rootDir, this.dir)
      .then(_ => console.info('exists', this.rootDir, this.dir))
      .catch(_ => {
        console.info('not exists', this.rootDir, this.dir);
        this.file.createDir(this.rootDir, this.dir, false)
          .then(result => console.info('created', this.rootDir, this.dir))
          .catch(error => console.error('not created', error));
      });
  }

  private managePlaylists() {
    this.plManager.playlists$.subscribe(
      playlists => {
        if (playlists && playlists.length) {

          let host = this.servers.host;
          if (!host) {
            console.warn('Offline@managePlaylists', 'no host found');
          }
          if (!this.playlist[host]) {
            this.playlist[host] = {};
          }

          playlists.forEach(playlist => {
            this.playlist[host][playlist.id] = false;

            this.getPlaylistFilesStats(playlist)
              .then(stats => {
                let offline = true;
                stats.forEach(stat => {
                  if (stat.offline) {
                    if (!this.offlineFiles[stat.medium.provider_sid]) {
                      this.offlineFiles[stat.medium.provider_sid] = [];
                    }
                    if (this.offlineFiles[stat.medium.provider_sid].filter(file => stat.file.id == file.file.id).length === 0) {
                      this.offlineFiles[stat.medium.provider_sid].push({
                        file: stat.file,
                        path: this.getPlaylistDir(playlist) + stat.file.filename
                      });
                    }
                  }
                  else {
                    offline = false;
                  }
                });

                this.playlist[host][playlist.id] = offline;
              });
          });
        }
      }
    );
  }

  /**
   * @param {Playlist} playlist
   * @returns {Promise<any[]>}
   */
  private getPlaylistFilesStats(playlist: Playlist) {
    let slug = this.slug.slugify(playlist.name);

    let promises: Promise<{ offline: boolean, medium: Medium, file: MediaFile }[]>[] = [];

    playlist.media.forEach(medium => {
      promises.push(
        this.isMediumOffline(slug, medium)
      );
    });

    return Promise.all(promises)
      .then(results => {
        let stats = [];
        results.forEach(mediumResult => {
          mediumResult.forEach(fileResult => {
            stats.push(fileResult);
          })
        });

        return stats;
      });
  }

  private isMediumOffline(dir: string, medium: Medium) {
    let promises: Promise<{ offline: boolean, medium: Medium, file: MediaFile }>[] = [];
    medium.files.forEach(file => {
      promises.push(
        this.isMediumFileOffline(dir, medium, file)
      );
    });

    return Promise.all(promises);
  }

  private isMediumFileOffline(dir: string, medium: Medium, file: MediaFile) {
    console.info('Offline@isMediumFileOffline', this.rootDir + this.dir + '/' + dir, file.filename);
    return this.file.checkFile(this.getDir(dir), file.filename)
      .then(result => {
        console.info('isOffline', result, file.filename);
        return {offline: true, medium: medium, file: file};
      })
      .catch(error => {
        console.info('notOffline', error, file.filename);
        return ({offline: false, medium: medium, file: file});
      });
  }

  private getDir(dir: string) {
    return this.rootDir + this.dir + '/' + dir + '/';
  }

  private getPlaylistDir(playlist: Playlist) {
    return this.getDir(this.slug.slugify(playlist.name));
  }

  private startDownloading() {
    if (!this.downloading && this.offlineQueue.length) {
      console.info('Offline@onDownloadStart');
      this.onDownloadStart.next(true);
      return this.downloadNext();
    }
    else {
      console.info('Offline@onDownloadFinish');
      this.onDownloadFinish.next(true);
      return true;
    }
  }

  private downloadNext() {
    console.info('Offline@downloadNext');
    if (this.offlineQueue.length) {
      console.info('Offline@downloading');
      return this.download(this.offlineQueue[0])
        .then(result => {
          if (result) {
            this.offlineQueue.shift();
            this.downloading = false;
            return this.downloadNext();
          }
          else {
            return false;
          }
        });

      // @todo - progress
    }
    else {
      console.info('Offline@finishing');
      this.onDownloadFinish.next(true);
      return true;
    }
  }

  private download({dir, file, url}) {

    this.downloading = true;

    return this.downloadChunkTo(url, this.getDir(dir), file.filename, 0);

    // this.file.writeFile(this.rootDir + this.dir + dir, file.filename, false)
    //   .then(result => {
    //     // this.file.writeFile();
    //   });
  }

  private stopDownloading() {
    // @todo - cancel download
    this.downloading = false;
  }

  private getFileChunk(url: string, from: number) {
    console.info('Offline@getFileChunk', url, from);

    return this.http.get(url, {
      headers: {
        Range: 'bytes=' + from.toString() + '-'
      },
      observe: 'response',
      responseType: 'blob'
    }).toPromise();
  }

  private downloadChunkTo(url: string, dir: string, filename: string, from: number = 0, maxSize = -1) {
    console.info('Offline@downloadChunkTo', url, dir, filename, from);

    this.onDownloadProgress.next({
      filename: filename,
      progress: from / maxSize
    });

    return this.getFileChunk(url, from)
      .then(
        response => {
          let blob = response.body;

          // @todo - testing
          if (maxSize < 0) {
            maxSize = parseInt(
              response.headers.get('Content-Range').match(/bytes 0-\d+\/(\d+)/)[1]
            );
          }

          // console.info('Offline@headers', response.headers, response.headers.keys(),
          //   response.headers.get('Content-Range'), response.headers.get('Accept-Ranges'));
          console.info('Offline@blob', blob, dir, filename, url, maxSize);

          if (blob.size) {
            return this.file.writeFile(dir, filename, blob, {
              append: from > 0
            })
              .then(written => {
                // if (maxSize - blob.size > 0 || maxSize < 0) {
                if (blob.size + from < maxSize) {
                  return this.downloadChunkTo(url, dir, filename, from + blob.size, maxSize);
                }
                // }
                else {
                  this.onDownloadProgress.next({
                    filename: filename,
                    progress: 1
                  });
                  return true;
                }
              });
          }
          else {
            return false;
          }
        }
      )
  }

  private init() {
    this.rootDir = null;

    // this.file = new File;

    if (this.file) {
      console.info(this.file);

      if (this.platform.is('ios')) {
        this.rootDir = this.file.documentsDirectory;
      }
      else if (this.platform.is('android')) {
        this.rootDir = this.file.externalRootDirectory || this.file.dataDirectory;
      }

      if (this.rootDir) {
        // @todo - settings
        this.dir = 'ThePlaylist.shared';

        this.prepareDir()
          .then(result => this.managePlaylists());
      }
    }

    this.network.onConnect().subscribe(
      result => {
        setTimeout(() => {
          this.canDownload = this.network.type === 'wifi';
          if (this.canDownload && this.offlineQueue) {
            this.startDownloading();
          }
        }, 5000);
      }
    );

    this.network.onDisconnect().subscribe(
      result => {
        this.canDownload = false;
        this.stopDownloading();
      }
    );

    this.ready = true;
  }
}


