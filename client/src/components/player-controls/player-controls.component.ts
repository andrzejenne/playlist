import {ChangeDetectorRef, Component} from "@angular/core";
import {PlayerService} from "../../services/PlayerService";

@Component({
  selector: 'player-controls-component',
  templateUrl: 'player-controls.component.html'
})
export class PlayerControlsComponent {

  playIcon = 'play';

  constructor(public player: PlayerService, ref: ChangeDetectorRef) {
    this.player.addChangeDetector(ref);
  }

  onSliderFocus(event) {
    // this.pause();
    this.player.pause();
  }

  onSliderBlur(event) {
    if (this.player.medium) {
      if (event.value != this.player.videoElement.currentTime) {
        this.player.videoElement.currentTime = +event.value;
      }
      this.player.videoElement.play();
    }
  }
}

