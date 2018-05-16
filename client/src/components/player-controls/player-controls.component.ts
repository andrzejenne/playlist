import {Component, Input} from "@angular/core";
import {Medium} from "../../models/medium";

@Component({
  selector: 'player-controls-component',
  templateUrl: 'player-controls.component.html'
})
export class PlayerControlsComponent {

  @Input()
  medium: Medium;

  currentTime: number;

  shuffle: boolean;

  repeat: boolean;

  playing: boolean;

  video: boolean;

  audio: boolean;

  playIcon = 'play';
}

