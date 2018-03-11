import {Injectable} from '@angular/core';
// import { HttpClient } from '@angular/common/http';

import {Repository} from "./repository";
import {RestUrl} from '../models/rest-url.model';
import config from '../config';
import {SearchItem} from "../models/search-item";
import {Search} from "../models/search";
import {SearchItemCollection} from "../models/search-item-collection";

@Injectable()
export class SearchRepository extends Repository {

  public search(q: string) {
    return this.get<SearchItemCollection>(RestUrl.buildUrl(config.serverHost + 'api/search', null, null, null, {q: q}));
  }

  public getSearchHistory() {
    return this.get<Search[]>(RestUrl.buildUrl(config.serverHost + 'api/search/list'));
  }

  public removeSearchHistory(id: number) {
    return this.delete(RestUrl.buildUrl(config.serverHost + 'api/search/list/' + id));
  }
}