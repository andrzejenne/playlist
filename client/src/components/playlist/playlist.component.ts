import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from "@angular/core";
import {Medium} from "../../models/medium";
import {SelectorService} from "../../services/SelectorService";

@Component({
  selector: 'playlist-component',
  templateUrl: 'playlist.component.html',
  providers: [SelectorService]
})
export class PlaylistComponent implements OnChanges, OnDestroy {
  @Input()
  removable: boolean;

  @Input()
  media: Medium[];

  private status = {
    shuffle: false,
    repeat: false,
    playing: false,
    video: false,
    audio: true,
  };

  private video = {
    width: 0,
    height: 0
  };

  constructor(private selector: SelectorService<Medium>) {

  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
  }


}
