import {Injectable} from '@angular/core';
import {Search} from "../models/search";
import {SearchItemCollection} from "../models/search-item-collection";
import {WampRepository} from "./wamp.repository";

@Injectable()
export class DownloadedRepository extends WampRepository {

    public list() {
        return this.wamp.call('com.downloaded.list');
    }
}
