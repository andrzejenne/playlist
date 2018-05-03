import {Injectable} from '@angular/core';
import {WampRepository} from "./wamp.repository";
import {Medium} from "../models/medium";

@Injectable()
export class DownloadedRepository extends WampRepository {

  public list() {
    return this.call<Medium[]>('com.downloaded.list');
  }
}
