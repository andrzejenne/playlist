import {Injectable} from '@angular/core';
import {RestUrl} from '../models/rest-url.model';
import {HttpClient} from '@angular/common/http';
import {ServerManagerService} from "../services/ServerManagerService";

@Injectable()
export class Repository {
  protected get = this.http.get;
  protected delete = this.http.delete;
  protected serverHosts: string[] = [];

  constructor(protected http: HttpClient, protected serverManager: ServerManagerService) {
    this.boot();

    serverManager.ready()
      .then(servers => {
        for(let host in servers){
          this.serverHosts.push(this.serverManager.getServerUrl(host, ''));
        }
      });
  }

  protected baseUrl: string;

  protected buildUrl(limit?: number, offset?: number, orderBy?: any, filter?: any): string[] {
    let urls = [];
    this.serverHosts.forEach(host => {
      urls.push(RestUrl.buildUrl(host + this.baseUrl, limit, offset, orderBy, filter))
    });

    return urls;
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
