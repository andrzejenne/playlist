import {Injectable} from '@angular/core';
import {WampRepository} from "./wamp.repository";
import {Provider} from "../models/provider";

@Injectable()
export class AppRepository extends WampRepository {

  public providers() {
    return this.wamp.call<Provider[]>('com.app.providers', []);
  }
}