import {Component, EventEmitter, Input, Output} from "@angular/core";
import {Medium} from "../../models/medium";
import {ElementReference} from "../../models/ElementReference";

@Component({
  selector: 'player-controls-component',
  templateUrl: 'player-controls.component.html'
})
export class PlayerControlsComponent {

  @Input()
  medium: Medium;

  @Input()
  status: {
    currentTime: number;
    shuffle: boolean;
    repeat: boolean;
    playing: boolean;
    video: boolean;
    audio: boolean;
  };

  @Output()
  pause = new EventEmitter();

  @Input()
  player: ElementReference<HTMLVideoElement>;

  playIcon = 'play';

  onSliderFocus(event) {
    // this.pause();
    this.pause.next(true);
  }

  onSliderBlur(event) {
    if (this.medium) {
      if (event.value != this.player.nativeElement.currentTime) {
        this.player.nativeElement.currentTime = +event.value;
      }
      this.player.nativeElement.play();
    }
  }
}

