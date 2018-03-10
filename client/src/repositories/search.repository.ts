import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

import { Repository } from "./repository";
import { RestUrl } from '../models/rest-url.model';
import config from '../config';

@Injectable()
export class SearchRepository extends Repository {
    getSearchList() {
        return this.get<string[]>(RestUrl.buildUrl(config.serverHost + 'api/search/list'));
    }
}