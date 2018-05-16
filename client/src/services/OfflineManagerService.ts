import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";
import {ServerManagerService} from "./ServerManagerService";
import {WampService} from "./WampService";

@Injectable()
export class OfflineManagerService {

  private connected: { [index: string]: boolean } = {};

  constructor(
    private storage: Storage,
    private servers: ServerManagerService,
    private wamp: WampService
  ) {
    wamp.connected.subscribe(host => this.connected[host] = true);
    wamp.disconnected.subscribe(host => this.connected[host] = false);
  }

  get isOffline() {
    for(let host in this.connected) {
      if (this.connected[host]) {
        return false;
      }
    }

    return true;
  }

}
