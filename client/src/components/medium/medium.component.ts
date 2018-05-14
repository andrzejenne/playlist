import {Component, EventEmitter, Input, Output} from "@angular/core";
import {Medium} from "../../models/medium";

@Component({
  selector: 'medium-component',
  templateUrl: 'medium.component.html'
})
export class MediumComponent {
  @Input()
  item: Medium;

  @Input()
  selected: boolean;

  @Input()
  hasVideo: boolean;

  @Input()
  hasAudio: boolean;

  @Input()
  thumbnail: string;

  @Input()
  landscape: boolean;

  @Output()
  select = new EventEmitter();

  @Output()
  play = new EventEmitter();

  @Output()
  toPlaylist = new EventEmitter();
}
