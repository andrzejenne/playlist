import {
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Input, OnDestroy, Optional, Output,
  ViewChild
} from "@angular/core";
import {Medium} from "../../models/medium";
import {SelectorService} from "../../services/SelectorService";
import {Playlist} from "../../models/playlist";
import {ElementReference} from "../../models/ElementReference";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";
import {MediaManagerService} from "../../services/MediaManagerService";
import {Content, MenuController, ModalController, NavController, NavParams} from "ionic-angular";
import {Storage} from "@ionic/storage";
import {Subscription} from "rxjs/Subscription";
import {WampService} from "../../services/WampService";
import {LibraryPage} from "../../pages/library/library";
import {YouTubePage} from "../../pages/youtube/youtube";
import {CloudPage} from "../../pages/cloud/cloud";

@Component({
  selector: 'playlist-component',
  templateUrl: 'playlist.component.html',
  providers: [SelectorService]
})
export class PlaylistComponent implements OnDestroy {
  @Input()
  playlist: Playlist;

  mediaPlaylist: Medium[];

  playIcon: string = 'play';

  mediaType: string = 'audio';

  currentTime: number = 0;
  totalTime: number = 0;

  playedPlaylist: Medium[];

  current: Medium;

  @Input() player: ElementReference<HTMLVideoElement>;

  @ViewChild('progress') progress: ElementReference<HTMLDivElement>;

  @ViewChild('content') contentContainer: Content;

  @ViewChild('header') header: ElementRef;

  @Output()
  hide = new EventEmitter();

  pages = {
    all: CloudPage,
    library: LibraryPage,
    youtube: YouTubePage
  };

  hidden = true;

  arrowIcon = 'arrow-up';

  ready: boolean;

  private interval: number;

  private subs: Subscription[] = [];

  constructor(
    public selector: SelectorService<Medium>,
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
    if (params && params.data.id) {
      this.playlist = params.data;
      this.plManager.selectPlaylist(params.data);
      this.preparePlaylist();

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

  reorderData(indexes: any) {
    this.playlist.media = this.reorderArray(this.playlist.media, indexes);
  }

  reorderArray(array: any[], indexes: {from: number, to: number}): any[] {
    const element = array[indexes.from];
    array.splice(indexes.from, 1);
    array.splice(indexes.to, 0, element);
    return array;
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
      this.loadPlaylist(this.playlist);
      this.preparePlaylist();
    }

    this.subs.push(
      this.plManager.playlist$.subscribe(playlist => {
        console.info('PlaylistComponent@playlist$', playlist);
        this.updatePlaylist();
        this.ref.detectChanges();
      })
    );

    console.info(
      this.header.nativeElement.offsetHeight //.getNativeElement().offsetHeight
    );

  }

  ionViewDidEnter() {
    // this.menu.enable(true, 'playlistMenu');
    this.preparePlaylist();
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

    if (medium === this.current) {
      this.pause();
      this.current = null;

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

  isPlaying(item: Medium) {
    return this.current === item;
  }

  wasPlayed(item: Medium) {
    return this.playedPlaylist.indexOf(item) > -1;
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
        this.selector.selected.forEach(item => {
          PlaylistComponent.removeItemFrom(item, this.playedPlaylist);
          PlaylistComponent.removeItemFrom(item, this.mediaPlaylist);
        });
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

  /**
   * @deprecated
   * @param {Playlist} playlist
   */
  private loadPlaylist(playlist: Playlist) {
    this.plManager.selectPlaylist(playlist);
      // .then(media => this.preparePlaylist());
  }

  private preparePlaylist() {
    console.info('PlaylistComponent@preparePlaylist', this.playlist, this.playlist.media);
    this.mediaPlaylist = [].concat(this.playlist.media || []);
    this.playedPlaylist = [];
    if (this.status.shuffle) {
      this.shuffle(this.mediaPlaylist);
    }

    this.ready = true;
  }

  private updatePlaylist() {
    let remove = [];
    let exists = [];
    if (this.playedPlaylist) {
      this.playedPlaylist.forEach(item => {
        let index = this.playlist.media.indexOf(item);
        if (index == -1) {
          remove.push(item);
        }
        else {
          exists.push(item);
        }
      });
      remove.forEach(item => PlaylistComponent.removeItemFrom(item, this.playedPlaylist));
      remove = [];
    }

    if (this.mediaPlaylist) {
      this.mediaPlaylist.forEach(item => {
        let index = this.playlist.media.indexOf(item);
        if (index == -1) {
          remove.push(item);
        }
        else {
          exists.push(item);
        }
      });
      remove.forEach(item => PlaylistComponent.removeItemFrom(item, this.mediaPlaylist));
      remove = [];

      let toAdd = [].concat(this.playlist.media).filter(
        item => exists.indexOf(item) == -1
      );

      this.mediaPlaylist = this.mediaPlaylist.concat(toAdd);
    }
  }

  private preparePlaylistDiff() {
    this.mediaPlaylist.splice(0, this.mediaPlaylist.length);
    this.mediaPlaylist.push(...this.playlist.media);
    this.playedPlaylist = [];
  }

  private playStatus() {
    this.playIcon = this.status.playing ? 'pause' : 'play';
  }

  private play() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.status.playing = true;

    let player = this.getPlayer();

    player.play();

    this.interval = setInterval(this.onPlayerProgress, 100);

    this.playStatus();

    this.storage.set('currentMedium', this.current.id);
  }

  private pause() {
    clearInterval(this.interval);

    this.status.playing = false;
    this.getPlayer().pause();

    this.playStatus();
  }

  private shuffle(arr: any[]) {
    arr.sort(PlaylistComponent.shuffleCallback);
  }

  private initPlayers() {
    this.videoPlayer.nativeElement.onended = this.onPlayerPlayEnded;
    this.videoPlayer.nativeElement.onloadedmetadata = this.onPlayerMetadata;
    // this.audioPlayer.nativeElement.onended = this.onPlayerPlayEnded;
  }

  private static shuffleCallback = (a: any, b: any) => {
    return Math.round(Math.random() * 2) - 1;
  };

  private static filterPlayed(played: Medium[], current: Medium) {
    return (item: Medium) => {
      return current !== item && played.indexOf(item) === -1;
    };
  }

  private static removeItemFrom(item: Medium, arr: Medium[]) {
    let index = arr.indexOf(item);
    if (index > -1) {
      arr.splice(index, 1);
    }
  }
}
