import {Component, Input} from "@angular/core";
import {NavParams} from "ionic-angular";

/**
 * @deprecated
 */
@Component({
  selector: 'video-player-component',
  templateUrl: 'video-player.component.html'
})
export class VideoPlayerComponent {
  @Input() src: string;
  @Input() thumbnail: string;
  @Input() type: string;
  @Input() width: number;

  constructor(params: NavParams) {
    let src = params.get('src');
    let type = params.get('type');
    let thumbnail = params.get('thumbnail');
    let width = params.get('width');
    if (src) {
      this.src = src;
    }
    if (type) {
      this.type = type;
    }
    if (thumbnail) {
      this.thumbnail = thumbnail;
    }
    if (width) {
      this.width = width;
    }
  }
}
