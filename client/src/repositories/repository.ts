import { Injectable } from '@angular/core';
import { RestUrl } from '../models/rest-url.model';
import { HttpClient } from '@angular/common/http';
import config from '../config';

@Injectable()
export class Repository {
    protected get = this.http.get;
    protected delete = this.http.delete;

    constructor(protected http: HttpClient) { 
        this.boot();
    }

    protected baseUrl: string;

    protected buildUrl(limit?: number, offset?: number, orderBy?: any, filter?: any) {
        return RestUrl.buildUrl(config.serverHost + this.baseUrl, limit, offset, orderBy, filter);
    }

    private boot() {
        this.get = this.get.bind(this.http);
        this.delete = this.delete.bind(this.http);
    }

    // protected post = this.http.post.bind(this.http);
    // protected put = this.http.put.bind(this.http);
    // protected patch = this.http.patch.bind(this.http);
    // protected delete = this.http.delete.bind(this.http);
}