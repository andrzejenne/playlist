import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy} from "@angular/core";
import {ServerManagerService} from "../../services/ServerManagerService";
import {Server} from "../../models/server";
import {WampService} from "../../services/WampService";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'server-manager-component',
  templateUrl: 'server-manager.component.html'
})
export class ServerManagerComponent implements AfterViewInit, OnDestroy {

  servers: { [index: string]: Server } = {};

  hosts: string[] = [];

  newServer: Server = <Server>{};

  private subs: Subscription[] = [];

  constructor(private serverManager: ServerManagerService, private wamp: WampService, private ref: ChangeDetectorRef) {

  }

  ngAfterViewInit() {
    this.subs.push(
      this.serverManager.servers$.subscribe(
        servers => {
          this.setServers(servers);
          this.ref.detectChanges();
        }
      )
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
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
    this.wamp.connect(host);
  }

  onDisconnectClick(host: string) {
    this.wamp.disconnect(host);
  }

  private setServers(servers: { [index: string]: Server }) {
    this.servers = servers;
    this.hosts = [];
    for (let host in servers) {
      this.hosts.push(host);
    }
  }
}
