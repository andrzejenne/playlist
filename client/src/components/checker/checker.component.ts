import {Component, HostBinding, Input} from "@angular/core";

@Component({
  selector: 'checker',
  templateUrl: 'checker.component.html'
})
export class CheckerComponent {
  @HostBinding('class')
  cls = 'checkbox';

  @HostBinding('class.show')
  @Input()
  visible: boolean;

  @Input()
  color = 'primary';

  @Input()
  selected: boolean;

  ngAfterViewInit() {
    console.info('CheckerComponent', this);
    this.visible = false;
  }
}