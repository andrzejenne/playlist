import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy} from "@angular/core";
import {ServerManagerService} from "../../services/ServerManagerService";
import {Server} from "../../models/server";
import {WampService} from "../../services/WampService";
import {Subscription} from "rxjs/Subscription";
import {ConfigService} from "../../services/ConfigService";
import {HomePage} from "../../pages/home/home";

@Component({
  selector: 'server-switch-component',
  templateUrl: 'server-switch.component.html'
})
export class ServerSwitchComponent implements OnDestroy, AfterViewInit {

  host: string;

  servers: string[] = [];

  serverOptions: { value: any, label: string }[] = [];

  private subs: Subscription[] = [];

  constructor(private serverManager: ServerManagerService,
              private wamp: WampService,
              private config: ConfigService,
              private ref: ChangeDetectorRef
  ) {

  }

  ngAfterViewInit() {
    this.serverManager.ready()
      .then(servers => {
        console.info('ServerSwithComponent@ionViewDidLoad,ready', servers);
        this.setupServers(servers);

        this.subs.push(
          this.serverManager.servers$.subscribe(
            servers => this.setupServers(servers)
          )
        );
      });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  onServerChange() {
    // console.info(event, this.server);
    if (this.host) {
      this.wamp.connect(this.host);
    }
  }

  private setupServers(servers: { [index: string]: Server }) {
    this.servers = Object.keys(servers) || [];
    this.serverOptions = this.servers.map(
      host => {
        return {value: host, label: host.split('.')[0]}
      }
    );

    this.ref.detectChanges();
  }


}
