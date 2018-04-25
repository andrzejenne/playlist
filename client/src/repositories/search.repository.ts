import {Injectable} from '@angular/core';
import {Search} from "../models/search";
import {SearchItemCollection} from "../models/search-item-collection";
import {WampRepository} from "./wamp.repository";

@Injectable()
export class SearchRepository extends WampRepository {

  public search(uid: number, q: string, args: any = {}) {
    return this.wamp.call<SearchItemCollection>('com.search', [{uid: uid, q: q, ...args}]);
  }

  public getSearchHistory(uid: number) {
    return this.wamp.call<Search[]>('com.search.list', [{uid: uid}]);
  }

  public removeSearchHistory(id: number) {
    return this.wamp.call('com.search.list.delete', [{id: id}]);
  }

  public getInfo(sid: string) {
    return this.wamp.call('com.info', [{sid: sid}]);
  }
}