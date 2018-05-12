import {
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import {Playlist} from "../../models/playlist";
import {User} from "../../models/user";

@Component({
  selector: 'playlists-combo',
  templateUrl: 'playlist-combo.component.html'
})
export class PlaylistComboComponent {

  @Input()
  user: User;

  @Input()
  playlist: Playlist;

  @Input()
  playlists: Playlist[] = [];

  @Output()
  selected = new EventEmitter<Playlist>();
}
