import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Server} from "../models/server";
import {Medium} from "../models/medium";
import {MediaFile} from "../models/media-file";
import {HttpClient} from "@angular/common/http";
import {ErrorReporting} from "./ErrorReporting";
import autobahn from 'autobahn';
import {ConfigService} from "./ConfigService";
import {SettingsContract} from "./contracts/SettingsContract";

@Injectable()
export class ServerManagerService {

  private static serverDiscoveryProtocolPorts = {
    http: [null, 8000, 8080, 8100],
    https: [null]
  };

  host: string;

  servers: { [index: string]: Server } = {};

  servers$ = new BehaviorSubject<{ [index: string]: Server }>(this.servers);

  private sessions = {};

  private connecting = {};

  private connected = {};

  private isReady: boolean;

  private readyResolvers: any[] = [];

  private settings: SettingsContract;

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private errorReporter: ErrorReporting,
    private config: ConfigService
  ) {

    config.settings$.subscribe(settings => {
      if (settings) {
        this.settings = settings;
      }
    });

    storage.get('servers')
      .then(servers => {
        console.info('storage.servers', servers);
        this.servers = servers || {};

        this.isReady = true;

        this.servers$.next(this.servers);

        if (this.readyResolvers) {
          this.readyResolvers.forEach(r => r(this.servers));
          this.readyResolvers = [];
        }
      })
      .catch(error => {
        console.info('error', error);
      });
  }

  getServer(host: string) {
    return this.servers[host] || null;
  }

  getCurrentServer() {
    return this.getServer(this.host);
  }

  getSession(host: string) {
    return this.sessions[host];
  }

  hasServers() {
    return Object.keys(this.servers).length > 0;
  }

  setServer(host: string) {
    if (this.host != host) {
      this.host = host;

      this.settings.server = this.host;
      this.config.save(this.settings);
    }
    return this;
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

  discover(host: string) {
    return new Promise<Server>((resolve, reject) => {
      let attempts = 0;
      let errors = 0;

      for (let proto in ServerManagerService.serverDiscoveryProtocolPorts) {
        ServerManagerService.serverDiscoveryProtocolPorts[proto].forEach(port => {
          attempts++;
          let url = this.getServerDiscoveryUrl(host, proto, port);
          this.http.get<Server>(url)
            .subscribe(response => {
              console.info('Server Discoverty Succes', host, proto, port, response);
              resolve(response);
            }, error => {
              console.info('Server Discovery Error', error);
              errors++;

              if (errors == attempts) {
                this.errorReporter.report({
                  message: ['No instances running on ', host].join(' ')
                });
              }
            })
        });
      }
    });
  }

  setSession(host: string, session: autobahn.Session) {
    this.sessions[host] = session;
    this.connected[host] = true;
    this.connecting[host] = false;
  }

  setConnecting(host: string, is: boolean) {
    this.connecting[host] = is;
  }

  close(host: string) {
    this.sessions[host] = null;
    this.connected[host] = false;
  }

  isConnected(host: string) {
    if (this.connected[host]) {
      return this.connected[host] === true;
    }
    return false;
  }

  ready(): Promise<{ [index: string]: Server }> {
    return new Promise(this.onReady);
  }

  each(callback: any) {
    for (let host in this.servers) {
      callback(this.servers[host], host);
    }
  }

  getServerUrl(host: string, uri: string = '') {
    return Server.getHost(this.servers[host]) + uri;
  }

  getServerDiscoveryUrl(host: string, proto: string, port: string | null) {
    return proto + '://' + host + (port ? ':' + port : '') + '/api/discover';
  }

  canConnect(server: Server) {
    return !this.connecting[server.host] && !this.connected[server.host];
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
