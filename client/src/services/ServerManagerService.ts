import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Server} from "../models/server";

@Injectable()
export class ServerManagerService {

  servers: {[index: string]: Server} = {};

  servers$ = new BehaviorSubject<{[index: string]: Server}>(this.servers);

  private sessions = {};

  private isReady: boolean;

  private readyResolver: any;

  private readyRejector: any;

  constructor(private storage: Storage) {
    storage.get('servers')
      .then(servers => {
        this.servers = servers || {};

        if (servers && Object.keys(servers).length) {
          this.isReady = true;
          this.servers$.next(this.servers);
          if (this.readyResolver) {
            this.readyResolver(servers);
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

  private onReady = (resolve, reject) => {
    if (this.isReady) {
//      if (this.isReady) {
        resolve(this.servers);
//      }
//      else {
//        reject(this.servers);
//      }
    }
    else {
      this.readyResolver = resolve;
      this.readyRejector = reject;
    }
  }

}
