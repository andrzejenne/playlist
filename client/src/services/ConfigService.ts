import {Injectable} from '@angular/core';
import config from '../config';
import {SettingsContract} from "./contracts/SettingsContract";
import {Storage} from "@ionic/storage";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class ConfigService {
  config = config;

  settings: SettingsContract;

  settings$: BehaviorSubject<SettingsContract> = new BehaviorSubject<SettingsContract>(this.settings);

  constructor(private store: Storage) {
    store.get('settings')
      .then(settings => {
        if (settings) {
          this.settings$.next(settings);
        }
        else {
          this.settings$.next(new SettingsContract());
        }
      });

    this.settings$.subscribe(settings => this.settings = settings);
  }

  get(path: string) {
    return path.split('.')
      .reduce((o, i) => o[i], this.config);
  }

  save(settings: SettingsContract) {
    this.store.set('settings', settings)
      .then(result => this.settings$.next(settings));
  }

  // ready() {
  //   if (this.settings) {
  //     return new Promise(resolve => resolve(this.settings));
  //   }
  //   else {
  //
  //   }
  // }

  isWebApp = document.URL.startsWith('http');
}