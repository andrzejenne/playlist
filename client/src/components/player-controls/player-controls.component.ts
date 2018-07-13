import {ChangeDetectorRef, Component, SimpleChanges} from "@angular/core";
import {PlayerService} from "../../services/PlayerService";
import {MediaManagerService} from "../../services/MediaManagerService";

@Component({
  selector: 'player-controls-component',
  templateUrl: 'player-controls.component.html'
})
export class PlayerControlsComponent {

  playIcon = 'play';

  constructor(public player: PlayerService, public mediaManager: MediaManagerService, ref: ChangeDetectorRef) {
    this.player.addChangeDetector(ref);
  }

  ngAfterViewInit() {

  }

  ngOnChanges(change: SimpleChanges) {
    console.info('changes', change);
  }

  onSliderFocus(event) {
    // this.pause();
    this.player.pause();
  }

  onSliderBlur(event) {
    if (this.player.medium) {
      let playerContainer = this.player.getPlayerContainer();
      if (event.value != playerContainer.currentTime) {
        playerContainer.currentTime = +event.value;
      }
      this.player.play();
    }
  }
}

