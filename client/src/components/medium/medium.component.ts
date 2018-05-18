import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output} from "@angular/core";
import {Medium} from "../../models/medium";

@Component({
  selector: 'medium-component',
  templateUrl: 'medium.component.html'
})
export class MediumComponent implements AfterViewInit {
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

  @Input()
  hasPlaylist: boolean;

  @Output()
  select = new EventEmitter();

  @Output()
  playVideo = new EventEmitter();

  @Output()
  playAudio = new EventEmitter();

  @Output()
  toPlaylist = new EventEmitter();

  details: string = '';

  constructor(private ref: ChangeDetectorRef) {

  }

  ngAfterViewInit() {
    this.setDetails();
  }

  private setDetails() {
    let details = [];
    if (this.item.artist) {
      this.item.artist.name && details.push(this.item.artist.name);
    }
    if (this.item.album) {
      this.item.album.name && details.push(this.item.album.name);
    }

    this.details = details.join(' | ');

    this.ref.detectChanges();
  }
}
