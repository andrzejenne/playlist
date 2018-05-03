import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";

@Injectable()
export class FullscreenObserverService {
  public change$ = new Subject<boolean>();

  private getter: string;

  constructor() {
    if (document.fullscreenElement !== undefined) {
      this.getter = 'fullscreenElement';
    }
    else if (document.webkitFullscreenElement !== undefined) {
      this.getter = 'webkitFullscreenElement';
    }

    switch (this.getter) {
      case 'fullscreenElement':
        this.addListener('fullscreenchange');
        break;
      case 'webkitFullscreenElement':
        this.addListener('webkitfullscreenchange');
        break;
    }

    console.info('fullscreen.observer', this.getter);

    if (this.getter) {
      this.change$.next(this.isFull());
      console.info('isFull', this.isFull());
    }
    else {
      console.info('not getter found');
    }
  }

  private addListener(type: string) {
    document.addEventListener(type, this.eventListener);
  }

  private isFull() {
    return document[this.getter] !== null;
  }

  private eventListener = (event) => {
    console.info('isFull', this.isFull());
    // The event object doesn't carry information about the fullscreen state of the browser,
    // but it is possible to retrieve it through the fullscreen API
    this.change$.next(this.isFull());
  };
}
