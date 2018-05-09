import * as _ from 'lodash';

export class SettingsContract {

  constructor(settings?: SettingsContract) {
    settings && _.merge(this, settings);
  }

  server?: string = null;

  player?: {
    autoplay?: {
      lastPosition?: boolean;
    };
  } = {
    autoplay: {
      lastPosition: true
    }
  };

  dayMode?: {
    value?: boolean;
    auto?: boolean;
    from?: number;
    till?: number;
  } = {
    value: true,
    auto: false,
    from: 0,
    till: 0
  }
}