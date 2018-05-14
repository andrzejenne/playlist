import {ChangeDetectorRef, Component} from '@angular/core';
import {MediaManagerService} from "../../services/MediaManagerService";
import {Medium} from "../../models/medium";
import {SelectorService} from "../../services/SelectorService";
import {Platform} from "ionic-angular";

@Component({
  selector: 'page-youtube',
  templateUrl: 'youtube.html',
  providers: [
    SelectorService
  ]
})
export class YouTubePage {

  media: Medium[] = [];

  constructor(
    public platform: Platform,
    public selector: SelectorService<Medium>,
    private mediaManager: MediaManagerService,
    private ref: ChangeDetectorRef) {

  }

  ionViewDidLoad() {
    this.mediaManager.getByProvider('youtube')
      .then(
        media => (this.media = media) && this.ref.detectChanges()
      );
  }
}
