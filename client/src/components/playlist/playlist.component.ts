import {
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Input, OnDestroy, Optional, Output,
  ViewChild
} from "@angular/core";
import {Medium} from "../../models/medium";
import {SelectorService} from "../../services/SelectorService";
import {Playlist} from "../../models/playlist";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";
import {MediaManagerService} from "../../services/MediaManagerService";
import {Content, MenuController, ModalController, NavController, NavParams} from "ionic-angular";
import {Storage} from "@ionic/storage";
import {Subscription} from "rxjs/Subscription";
import {WampService} from "../../services/WampService";
import {LibraryPage} from "../../pages/library/library";
import {YouTubePage} from "../../pages/youtube/youtube";
import {CloudPage} from "../../pages/cloud/cloud";
import {PlayerService} from "../../services/PlayerService";

@Component({
  selector: 'playlist-component',
  templateUrl: 'playlist.component.html',
  providers: [SelectorService]
})
export class PlaylistComponent implements OnDestroy {
  @Input()
  playlist: Playlist;

  @ViewChild('content') contentContainer: Content;

  @ViewChild('header') header: ElementRef;

  @Output()
  hide = new EventEmitter();

  pages = { // @todo - into service
    all: CloudPage,
    library: LibraryPage,
    youtube: YouTubePage
  };

  hidden = true;

  arrowIcon = 'arrow-up';

  private subs: Subscription[] = [];

  constructor(
    public selector: SelectorService<Medium>,
    private player: PlayerService,
    private storage: Storage,
    private plManager: PlaylistsManagerService,
    private mediaManager: MediaManagerService,
    private wamp: WampService,
    private menu: MenuController,
    private ref: ChangeDetectorRef,
    private modalCtrl: ModalController,
    @Optional() public nav: NavController = null,
    @Optional() private params: NavParams = null
  ) {
    this.player.addChangeDetector(this.ref);

    if (params && params.data.id) {
      this.playlist = params.data;
      this.plManager.selectPlaylist(params.data);
      this.player.preparePlaylist();

      this.subs.push(
        this.wamp.serverSwitched.subscribe(servers => {
          console.info('PlaylistComponent.serverSwitched', servers);
          // this.playlist = null;
          // this.current = null;
          // this.playedPlaylist = null;
          // this.mediaPlaylist = null;
          // this.ref.detectChanges();
          this.nav && this.nav.pop();
        }),
        // this.plManager.playlist$.subscribe(playlist => this.ref.detectChanges())
      );
    }
  }

  onHide() {
    this.hide.emit(true);
  }

  toggleShow() {
    if (this.hidden) {
      this.hide.emit(false);
      this.arrowIcon = 'arrow-down';
    }
    else {
      this.hide.emit(true);
      this.arrowIcon = 'arrow-up';
    }
    this.hidden = !this.hidden;
  }

  ngAfterViewInit() {
    if (this.params && !this.params.data.id) {
      this.prepare();
    }

    this.subs.push(
      this.plManager.playlist$.subscribe(playlist => {
        console.info('PlaylistComponent@playlist$', playlist);
        this.playlist = playlist;
        this.player.updatePlaylist();
        this.ref.detectChanges();
      })
    );

    console.info(
      this.header.nativeElement.offsetHeight //.getNativeElement().offsetHeight
    );

  }

  ionViewDidEnter() {
    // this.menu.enable(true, 'playlistMenu');
    this.prepare();
  }

  // togglePlaylistMenu() {
  //   if (this.menu.isOpen('playlistMenu')) {
  //     this.menu.close('playlistMenu');
  //   }
  //   else {
  //     this.menu.open('playlistMenu');
  //   }
  // }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  // onItemSwipe(item: Medium, direction) {
  //   if ('right' == direction) {
  //     this.playFirst(item);
  //   }
  //   else if ('left' == direction) {
  //     this.removeItem(item);
  //   }
  //   // console.info('item swipe', event);
  // }

  removeItem(medium: Medium) {
    console.info('PlaylistComponent@removeItem', medium);

    if (this.player.isCurrent(medium)) {
      this.player.stop();

      console.warn('IMPLEMENT current removal')
      // let player = this.getPlayer();
      // player.currentTime = 0;
      // player.src = '';
    }

    return this.plManager.removeFromPlaylist(medium, this.playlist)
      .then(num => {
        console.info('removed', num);
        this.ref.detectChanges();
        return num;
      });
  }

  removeSelected() {
    console.info('PlaylistComponent@removeSelected');

    let removed = [];
    this.selector.selected
      .forEach(
        item => removed.push(this.removeItem(item)
        )
      );

    return Promise.all(removed)
      .then(val => {
        console.info('removedSelected', val);
        this.selector.selected.forEach(item => this.player.removeMedium(item));
        this.selector.clearSelection();
        this.ref.detectChanges();
      });
  }

  open(page: string) {
    // let nav = this.nav || this.subNav;
    // nav.push(this.pages[page], this.playlist);
    this.modalCtrl.create(this.pages[page], this.playlist, {
      cssClass: 'fullscreen-modal'
    }).present();
  }

  private autoPlayIfInterrupted() {
    Promise
      .all([
        this.storage.get('playlist'),
        this.storage.get('currentMedium'),
        this.storage.get('currentTime')
      ])
      .then(values => {
        if (this.playlist.id == values[0]) {
          let medium = this.playlist.media.filter(item => item.id == values[1])[0];
          if (medium) {
            this.player.playItem(medium, values[2]);
          }
        }
      });
  }

  private prepare() {
    if (this.playlist) {
      this.player.setMedia(this.playlist.media);
      this.autoPlayIfInterrupted();
    }
    this.player.preparePlaylist();
  }
}
