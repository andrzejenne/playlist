import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output
} from "@angular/core";
import {Medium} from "../../../models/medium";

@Component({
  selector: 'item-component',
  templateUrl: 'item.component.html'
})
export class ItemComponent implements AfterViewInit {
  @Input()
  item: Medium;

  @Input()
  selected: boolean;

  @HostBinding('class.played')
  @Input()
  played: boolean;

  @HostBinding('class.current')
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

  description = '';

  @HostListener('swipe') onSwipe(event) {
    if (event.deltaX > 10) {
      this.swipe.emit('right');
    }
    else if (event.deltaX < -10) {
      this.swipe.emit('left');
    }
  }

  @HostListener('press') onPress() {
    this.select.emit(true);
  }

  constructor(private ref: ChangeDetectorRef) {

  }

  ngAfterViewInit() {
    this.prepareDescription();
  }

  private prepareDescription() {
    let description = [];

    if (this.item.artist) {
      description.push(this.item.artist.name);
    }
    if (this.item.album) {
      description.push(this.item.album.name)
    }

    this.description = description.join(' | ');
    this.ref.detectChanges();
  }
}
