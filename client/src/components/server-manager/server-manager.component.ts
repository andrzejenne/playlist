import {ChangeDetectorRef, Component} from "@angular/core";
import {ServerManagerService} from "../../services/ServerManagerService";
import {Server} from "../../models/server";
import {WampService} from "../../services/WampService";

@Component({
  selector: 'server-manager-component',
  templateUrl: 'server-manager.component.html'
})
export class ServerManagerComponent {

  servers: { [index: string]: Server } = {};

  hosts: string[] = [];

  newServer: Server = <Server>{};

  constructor(private serverManager: ServerManagerService, private wamp: WampService, private ref: ChangeDetectorRef) {

  }

  ionViewDidLoad() {
    this.serverManager.ready()
      .then(servers => {
        this.servers = servers;
        for (let host in servers) {
          this.hosts.push(host);
        }
        this.ref.detectChanges();
      });
  }

  onAddClick() {
    this.serverManager.add(<Server>{...this.newServer})
      .then(() => {
        this.servers[this.newServer.host] = {...this.newServer};
        this.hosts.push(this.newServer.host);
        this.newServer = <Server>{};
        this.ref.detectChanges();
      });
  }

  onRemoveClick(host: string) {
    this.serverManager.remove(this.servers[host])
      .then(() => {
        delete this.servers[host];
        this.ref.detectChanges();
      });
  }

  onConnectClick(host: string) {
    this.wamp.connect(this.servers[host]);
  }

  onDisconnectClick(host: string) {
    this.wamp.disconnect(this.servers[host]);
  }
}