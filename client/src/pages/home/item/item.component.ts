import {Component, EventEmitter, Input, Output} from "@angular/core";
import {Medium} from "../../../models/medium";

@Component({
  selector: 'item-component',
  templateUrl: 'item.component.html'
})
export class ItemComponent {
  @Input()
  item: Medium;

  @Input()
  selected: boolean;

  @Input()
  played: boolean;

  @Input()
  current: boolean;

  @Input()
  thumbnail: string;

  @Output()
  select = new EventEmitter();

  @Output()
  swipe = new EventEmitter();

  @Output()
  play = new EventEmitter();

  @Output()
  playFirst = new EventEmitter();

  onSwipe(event) {
    if (event.deltaX > 10) {
      this.swipe.emit('right');
    }
    else if (event.deltaX < -10) {
      this.swipe.emit('left');
    }
  }
}
