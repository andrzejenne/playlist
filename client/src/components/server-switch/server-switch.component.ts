import {
  AfterViewInit,
  Component, EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from "@angular/core";
import {ServerManagerService} from "../../services/ServerManagerService";

@Component({
  selector: 'server-switch-component',
  templateUrl: 'server-switch.component.html'
})
export class ServerSwitchComponent implements OnChanges, AfterViewInit {

  @Input()
  host: string;

  @Input()
  servers: string[] = [];

  serverOptions: { value: any, label: string }[] = [];

  @Output()
  server = new EventEmitter<string>();

  constructor(public serverManager: ServerManagerService) {

  }

  ngAfterViewInit(): void {
    this.setupServers(this.servers || [])
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['servers']) {
      this.setupServers(changes['servers'].currentValue || []);
    }
  }

  private setupServers(servers: string[]) {
    this.serverOptions = servers.map(
      host => {
        return {value: host, label: host.split('.')[0]}
      }
    );
  }


}
