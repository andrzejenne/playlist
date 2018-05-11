import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  AfterViewInit, OnDestroy
} from "@angular/core";
import {PlaylistsRepository} from "../../repositories/playlists.repository";
import {Playlist} from "../../models/playlist";
import {User} from "../../models/user";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'playlists-combo',
  templateUrl: 'playlist-combo.component.html'
})
export class PlaylistComboComponent implements OnChanges, AfterViewInit, OnDestroy {

  @Input()
  user: User;

  @Input()
  playlist: Playlist;

  public playlists: Playlist[] = [];

  @Output()
  selected = new EventEmitter<Playlist>();

  private subs: Subscription[] = [];

  constructor(
    private repo: PlaylistsRepository,
    private ref: ChangeDetectorRef
  ) {

  }

  ngAfterViewInit() {
    this.subs.push(
      this.repo.playlists$.subscribe(playlists => {
        this.playlists = playlists;
        this.ref.detectChanges();
      }),
    );

    // if (this.user && this.user.id) {
    //   this.loadPlaylists();
    // }
  }

  onPlaylistChange() {
    this.selected.next(this.playlist);
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (changes['user']) {
    //   // console.info('user changed');
    //   if (changes['user'].currentValue) {
    //     // console.info('ngOnChanges@loadPlaylist');
    //     this.repo.list(changes['user'].currentValue.id);
    //   }
    // }
    if (changes['playlist']) {
      if (changes['playlist'].currentValue) {
        this.playlist = changes['playlist'].currentValue;
        this.ref.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }


  // private loadPlaylists() {
  //   console.info('loadPlaylists');
  //   this.repo.list(this.user.id);
  // }
}
