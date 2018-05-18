import {Injectable} from '@angular/core';
import {WampRepository} from "./wamp.repository";
import {Medium} from "../models/medium";

@Injectable()
export class CloudRepository extends WampRepository {

  public list(limit: number, offset: number, search?: string, provider?: string) {
    return this.call<Medium[]>('com.cloud.list', [{limit: limit, offset: offset, search: search, pSlug: provider}]);
  }

  public remove(item: Medium) {
    return this.call<number>('com.cloud.remove', [{mid: item.id}]);
  }
}
