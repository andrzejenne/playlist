import {AfterViewInit, ChangeDetectorRef, Component} from "@angular/core";
import {ServerManagerService} from "../../services/ServerManagerService";
import {Server} from "../../models/server";
import {WampService} from "../../services/WampService";

@Component({
  selector: 'server-manager-component',
  templateUrl: 'server-manager.component.html'
})
export class ServerManagerComponent implements AfterViewInit {

  servers: { [index: string]: Server } = {};

  hosts: string[] = [];

  newServer: Server = <Server>{};

  constructor(private serverManager: ServerManagerService, private wamp: WampService, private ref: ChangeDetectorRef) {

  }

  ngAfterViewInit() {
    this.serverManager.ready()
      .then(servers => {
        this.setServers(servers);
        this.ref.detectChanges();
      });
  }

  onAddClick() {
    this.serverManager.discover(this.newServer.host)
      .then(server => {
        console.info('Resolved', server);
        this.serverManager.add(server)
          .then(servers => {
            this.setServers(servers);
            this.newServer = <Server>{};
            this.ref.detectChanges();
          });
      });
  }

  onRemoveClick(host: string) {
    this.serverManager.remove(this.servers[host])
      .then(servers => {
        this.setServers(servers);
        this.ref.detectChanges();
      });
  }

  onConnectClick(host: string) {
    this.wamp.connect(this.servers[host]);
  }

  onDisconnectClick(host: string) {
    this.wamp.disconnect(this.servers[host]);
  }

  private setServers(servers: { [index: string]: Server }) {
    this.servers = servers;
    for (let host in servers) {
      this.hosts.push(host);
    }
  }
}
