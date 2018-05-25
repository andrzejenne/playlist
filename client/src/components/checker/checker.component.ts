import {Component, EventEmitter, HostBinding, HostListener, Input, Output} from "@angular/core";

@Component({
  selector: 'checker',
  templateUrl: 'checker.component.html'
})
export class CheckerComponent {
  @HostBinding('class')
  cls = 'checkbox';

  @HostBinding('class.show')
  @Input()
  visible: boolean = false;

  @HostBinding('class.disabled')
  @Input()
  disabled: boolean = false;

  @HostListener('tap')
  onTap() {
    if (!this.disabled) {
      this.check.next(true);
    }
  }

  @Output()
  check = new EventEmitter<boolean>();

  @Input()
  color = 'primary';

  @Input()
  selected: boolean = false;

  ngAfterViewInit() {
    // console.info('CheckerComponent', this);
    this.visible = false;
  }
}