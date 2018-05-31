import {AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy} from "@angular/core";
import {NavParams, Platform} from "ionic-angular";
import {WampService} from "../../services/WampService";
import {ServerManagerService} from "../../services/ServerManagerService";

@Component({
  selector: 'connection-helper-component',
  templateUrl: 'connection-helper.component.html'
})
export class ConnectionHelperComponent implements AfterViewInit, OnDestroy {
  @Input()
  title: string;

  @Input()
  message: string;

  @Input()
  host: string;

  counter = 10;

  servers: string[] = [];

  private wamp: WampService;

  private _counter: number;

  private tout: number;

  constructor(params: NavParams,
              public platform: Platform,
              private serverManager: ServerManagerService,
              private ref: ChangeDetectorRef
  ) {
    if (params) {
      this.title = params.data.title;
      this.message = params.data.message;
      this.host = params.data.host;

      // @todo - circular dependency workaround, maybe not best practice, component is wired to service
      this.wamp = params.data.wamp;

      this.wamp.connectionModalComponent = this;
    }

    this.servers = Object.keys(this.serverManager.servers);
  }

  ngAfterViewInit() {
    this._counter = this.counter;
    this.reconnectCountdown();
  }

  ngOnDestroy() {
    if (this.tout) {
      clearTimeout(this.tout);
    }
  }

  resetCounter() {
    this.counter = this._counter;
    this.ref.detectChanges();

    this.reconnectCountdown();
  }

  closeApp() {
    this.platform.exitApp();
  }

  private reconnectCountdown() {
    this.tout = setTimeout(() => {
      this.counter--;
      this.ref.detectChanges();
      if (this.counter) {
        this.reconnectCountdown();
      }
      else {
        this.reconnect();
      }
    }, 1000);
  }

  private reconnect() {
    this.wamp.connect(this.host);
  }
}