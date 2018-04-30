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
  public playlist: Playlist;

  public playlists: Playlist[] = [];

  @Input()
  user: User;

  @Output()
  change = new EventEmitter<Playlist>();

  private subs: Subscription[] = [];

  constructor(
    private repo: PlaylistsRepository,
    private ref: ChangeDetectorRef
  ) {

  }

  ngAfterViewInit() {
      this.subs.push(
        this.repo.playlists$.subscribe(playlists => {
        console.info('playlists', playlists);
        this.playlists = playlists;
        if (playlists.length) {
          this.repo.selectPlaylist(playlists[0]);
        }
        this.ref.detectChanges();
      }),
      this.repo.playlist$.subscribe(playlist => {
        if (playlist) {
          console.info('playlist', playlist);
          this.playlist = playlist;
          this.change.next(playlist);
          // console.info('select playlist', playlist);
        }
        this.ref.detectChanges();
      })
    );

    if (this.user && this.user.id) {
      this.loadPlaylists();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user']) {
      // console.info('user changed');
      if (changes['user'].currentValue) {
        // console.info('ngOnChanges@loadPlaylist');
        this.repo.list(changes['user'].currentValue.id);
      }
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadPlaylists() {
    console.info('loadPlaylists');
    this.repo.list(this.user.id);
  }
}