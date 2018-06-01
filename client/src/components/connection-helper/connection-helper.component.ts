import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Optional, SimpleChanges
} from "@angular/core";
import {NavParams, Platform} from "ionic-angular";
import {WampService} from "../../services/WampService";
import {ServerManagerService} from "../../services/ServerManagerService";

@Component({
  selector: 'connection-helper-component',
  templateUrl: 'connection-helper.component.html'
})
export class ConnectionHelperComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input()
  title: string;

  @Input()
  message: string;

  @Input()
  host: string;

  @Input()
  @HostBinding('class.hidden')
  hidden: boolean;

  counter = 10;

  servers: string[] = [];

  private _counter: number;

  private tout: number;

  constructor(public platform: Platform,
              private serverManager: ServerManagerService,
              private wamp: WampService,
              private ref: ChangeDetectorRef,
              @Optional() params: NavParams
  ) {
    if (params) {
      this.title = params.data.title;
      this.message = params.data.message;
      this.host = params.data.host;
    }

    this.serverManager.servers$.subscribe(servers => this.servers = Object.keys(servers));
  }

  ngAfterViewInit() {
    this._counter = this.counter;
    if (!this.hidden) {
      this.reconnectCountdown();
    }
  }

  ngOnDestroy() {
    console.info('destroyed');
    this.clearTimeout();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['hidden']) {
      if (!changes['hidden'].currentValue) {
        this.resetCounter();
      }
      else {
        this.clearTimeout();
      }
    }
  }

  reconnect() {
    this.clearTimeout();
    this.wamp.connect(this.host);
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
    this.clearTimeout();

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

  private clearTimeout() {
    if (this.tout) {
      clearTimeout(this.tout);
      this.tout = null;
    }
  }
}