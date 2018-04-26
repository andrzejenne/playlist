import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";

@Injectable()
export class ServerManagerService {

  servers: string[] = [];

  private sessions = {};

  constructor(private storage: Storage) {
    storage.get('servers')
      .then(servers => this.servers = servers || []);
  }

  add(server: string) {
    this.servers.push(server);

    return this.storage.set('servers', this.servers);
  }

  remove(server: string) {
    let index = this.servers.indexOf(server);
    index > -1 && this.servers.splice(index, 1);

    return this.storage.set('servers', this.servers);
  }

  setSession(server: string, session: any) {
    this.sessions[server] = session;
  }

  close(server: string) {
    this.sessions[server] = null;
  }

  isConnected(server: string) {
    return this.sessions[server] !== undefined && this.sessions[server] !== null;
  }

}
