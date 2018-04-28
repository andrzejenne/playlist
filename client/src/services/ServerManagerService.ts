import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Server} from "../models/server";
import {Medium} from "../models/medium";
import {MediaFile} from "../models/media-file";

@Injectable()
export class ServerManagerService {

  servers: {[index: string]: Server} = {};

  servers$ = new BehaviorSubject<{[index: string]: Server}>(this.servers);

  private sessions = {};

  private isReady: boolean;

  private readyResolvers: any[] = [];

  constructor(private storage: Storage) {
    storage.get('servers')
      .then(servers => {
        // debugger;
        this.servers = servers || {};

        if (servers && Object.keys(servers).length) {
          this.isReady = true;
          this.servers$.next(this.servers);
          if (this.readyResolvers) {
            this.readyResolvers.forEach(r => r(servers));
            this.readyResolvers = [];
          }
        }
        else {
          this.isReady = false;
//          if (this.readyRejector) {
//            this.readyRejector(!servers ? 'no servers': servers);
//          }
        }
      })
      .catch(error => {
        console.info('error', error);
      });
  }

  add(server: Server) {
    this.servers[server.host] = server;
    this.servers$.next(this.servers);

    return this.storage.set('servers', this.servers);
  }

  remove(server: Server) {
    delete this.servers[server.host];
    this.servers$.next(this.servers);

    return this.storage.set('servers', this.servers);
  }

  setSession(host: string, session: any) {
    this.sessions[host] = session;
    this.servers[host].connected = true;
  }

  close(host: string) {
    this.sessions[host] = null;
    this.servers[host].connected = false;
  }

  isConnected(host: string) {
    return this.servers[host].connected === true;
  }

  ready():Promise<{[index: string]: Server}> {
    return new Promise(this.onReady);
  }

  each(callback: any) {
    for(let host in this.servers) {
      callback(this.servers[host], host);
    }
  }

  getServerUrl(host: string, uri: string = '') {
    return Server.getHost(this.servers[host]) + uri;
  }

  public getFile(item: Medium, type: string) {
    let files = item.files.filter(file => file.type.slug == type);

    if (files.length) {
      return files[0];
    }

    return null;
  }

  public getUrl(item: Medium, type: string) {
    let file = this.getFile(item, type);
    if (!file && type != 'video') {
      file = this.getFile(item, 'video');
    }

    if (file) {
      return this.getFileUrl(item, file);
    }

    return null;
  }

  public getFileUrl(item: Medium, file: MediaFile) {
    for( let host in this.servers) {
      return this.getServerUrl(host) + '/media/' + item.provider_sid + '/' + file.id;
    }
  }

  private onReady = (resolve, reject) => {
    if (this.isReady) {
        resolve(this.servers);
    }
    else {
      this.readyResolvers.push(resolve);
    }
  }

}
