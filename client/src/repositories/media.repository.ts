import {Injectable} from '@angular/core';
import {WampRepository} from "./wamp.repository";
import {Medium} from "../models/medium";

@Injectable()
export class MediaRepository extends WampRepository {

  public getByProvider(provider: string) {
    return this.call<Medium[]>('com.media.getByProvider', [{pSlug: provider}]);
  }

  public getByProviderId(providerId) {
    return this.call<Medium[]>('com.media.getByProvider', [{pid: providerId}]);
  }

}
