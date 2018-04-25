import {Injectable} from '@angular/core';
import {WampRepository} from "./wamp.repository";

@Injectable()
export class DownloadedRepository extends WampRepository {

  public list() {
    return this.call('com.downloaded.list');
  }
}
