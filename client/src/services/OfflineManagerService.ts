import {Injectable, Optional} from "@angular/core";
import {Storage} from "@ionic/storage";
import {ServerManagerService} from "./ServerManagerService";
import {WampService} from "./WampService";
import {File} from "@ionic-native/file";
import {Platform} from "ionic-angular";

@Injectable()
export class OfflineManagerService {

  private rootDir: string;

  private dir: string;

  // private file: File;

  constructor(
    private storage: Storage,
    private servers: ServerManagerService,
    private wamp: WampService,
    private platform: Platform,
    @Optional() private file: File = null
  ) {
    this.rootDir = null;

    // this.file = new File;

    if (this.file) {
      if (platform.is('ios')) {
        this.rootDir = this.file.documentsDirectory;
      }
      else if (platform.is('android')) {
        this.rootDir = this.file.externalRootDirectory;
      }

      if (this.rootDir) {
        this.dir = 'ThePlaylist.shared';

        this.file.checkDir(this.rootDir, this.dir)
          .then(_ => console.info('exists', this.rootDir, this.dir))
          .catch(_ => console.info('not exists', this.rootDir, this.dir));
      }
    }
  }

  get isOffline() {
    return !this.servers.isConnected();
  }

  get enabled() {
    return this.rootDir !== null;
  }

  test() {
    return this.file.listDir(this.rootDir, this.dir);
  }


}
