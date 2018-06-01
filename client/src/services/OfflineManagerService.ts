import {Injectable, Optional} from "@angular/core";
import {Storage} from "@ionic/storage";
import {ServerManagerService} from "./ServerManagerService";
import {WampService} from "./WampService";
import {Platform} from "ionic-angular";
import {File, FileError} from "@ionic-native/file";
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

  onDownloadFinish = new Subject();

  private rootDir: string;

  private dir: string;

  // private file: File;

  private ready;

  private slug = new Slug('default');

  private offlineQueue = [];

  private canDownload = false;

  private downloading = false;

  private offlineFiles = [];

  constructor(
    private storage: Storage,
    private servers: ServerManagerService,
    private wamp: WampService,
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

  public isPlaylistOffline(playlist: Playlist) {
    return this.getPlaylistFilesStats(playlist)
      .then(stats => stats.filter(stat => !stat.offline).length > 0)
      .then(offline => {
        console.info('Offline@isPlaylistOffline', offline);
        return offline;
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

  /**
   * @deprecated
   */
  private managePlaylists() {
    this.plManager.playlists$.subscribe(
      playlists => {
        if (playlists && playlists.length) {
          let promises = [];
          playlists.forEach(playlist => {
            promises.push(
              this.preparePlaylistDir(playlist)
                .then(result => this.addPlaylistMediaToOfflineQueue(playlist))
            );
          });

          Promise.all(promises).then(
            results => {
              console.info('Offline@queue', this.offlineQueue);

              // if (this.canDownload) {
              this.startDownloading();
              // }
            }
          );
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
          .then(results => {
            // results.forEach(result => {
            //   console.info('Offline@isMediumFileOffline', result[1], result[0]);
            // });

            return results;
          })
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

  /**
   * @deprecated
   * @param {Playlist} playlist
   * @returns {Promise<any[]>}
   */
  private addPlaylistMediaToOfflineQueue(playlist: Playlist) {
    let slug = this.slug.slugify(playlist.name);

    return this.file.listDir(this.rootDir + this.dir, slug)
      .then(result => {
        // console.info('Offline@addPlaylistMediaToOfflineQueue', result);

        let promises = [];

        playlist.media.forEach(medium => {
          promises.push(
            this.isMediumOffline(slug, medium)
              .then(results => {
                // results.forEach(result => {
                //   console.info('Offline@isMediumFileOffline', result[1], result[0]);
                // });

                return results;
              })
          );
        });

        return Promise.all(promises);
      })
      .then(result => {
        console.info('Offline@big-result', result);
        result.forEach(mediumResult => {
          mediumResult.forEach(mediumFileResult => {
            console.info('Offline@medium', mediumFileResult);
            if (false === mediumFileResult[0]) {
              this.offlineQueue.push({
                medium: mediumFileResult[1],
                file: mediumFileResult[2],
                dir: slug,
                url: this.mediaManager.getFileUrl(mediumFileResult[1], mediumFileResult[2])
              });
            }
            else {
              console.warn('is offline');
            }
          });
        });

        return result;
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
    return this.file.checkFile(this.rootDir + this.dir + '/' + dir + '/', file.filename)
      .then(result => {
        console.info('isMediumOfflineResult', result);
        return {offline: true, medium: medium, file: file};
      })
      .catch(error => {
        console.error('isMediumOfflineError', error);
        return ({offline: false, medium: medium, file: file});
      });
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

    return this.downloadChunkTo(url, this.rootDir + this.dir + '/' + dir, file.filename, 0);

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

        // @todo - only for debug
        if (!this.rootDir) {
          this.rootDir = 'file:///tmp/';
        }
      }

      if (this.rootDir) {
        // @todo - settings
        this.dir = 'ThePlaylist.shared';

        this.prepareDir();
        // .then(result => this.managePlaylists());
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


