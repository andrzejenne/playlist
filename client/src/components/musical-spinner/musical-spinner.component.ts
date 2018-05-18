import {Component, Input} from "@angular/core";

@Component({
  selector: 'musical-spinner',
  templateUrl: 'musical-spinner.component.html'
})
export class MusicalSpinnerComponent {
  rectStyle = {
    fill: 'black'
  };

  @Input()
  color: string = 'black';

  ngAfterViewInit() {
    this.rectStyle.fill = this.color;
  }
}