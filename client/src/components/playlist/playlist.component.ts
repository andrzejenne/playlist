import {
  ChangeDetectorRef,
  Component, Input, OnDestroy,
  ViewChild
} from "@angular/core";
import {Medium} from "../../models/medium";
import {SelectorService} from "../../services/SelectorService";
import {Playlist} from "../../models/playlist";
import {ElementReference} from "../../models/ElementReference";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";
import {MediaManagerService} from "../../services/MediaManagerService";
import {Content, MenuController, NavController, NavParams} from "ionic-angular";
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

  @ViewChild('audioPlayer') audioPlayer: ElementReference<HTMLAudioElement>;

  @ViewChild('videoPlayer') videoPlayer: ElementReference<HTMLVideoElement>;

  @ViewChild('progress') progress: ElementReference<HTMLDivElement>;

  @ViewChild('content') contentContainer: Content;

  pages = {
    all: CloudPage,
    library: LibraryPage,
    youtube: YouTubePage
  };

  status = {
    shuffle: false,
    repeat: false,
    playing: false,
    video: false,
    audio: true,
  };

  video: {
    width: number;
    height: number;
    containerStyle: any;
  } = {
    width: 0,
    height: 0,
    containerStyle: {width: '100%'}
  };

  ready: boolean;

  private interval: number;

  private subs: Subscription[] = [];

  constructor(
    public selector: SelectorService<Medium>,
    private storage: Storage,
    private plManager: PlaylistsManagerService,
    private mediaManager: MediaManagerService,
    private wamp: WampService,
    private params: NavParams,
    private nav: NavController,
    private menu: MenuController,
    private ref: ChangeDetectorRef,
  ) {
    if (params.data.id) {
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
          this.nav.pop();
        }),
        // this.plManager.playlist$.subscribe(playlist => this.ref.detectChanges())
      );
    }
  }

  ngAfterViewInit() {
    if (!this.params.data.id) {
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

  onItemSwipe(item: Medium, direction) {
    if ('right' == direction) {
      this.playItemFirst(item);
    }
    else if ('left' == direction) {
      this.removeItem(item);
    }
    // console.info('item swipe', event);
  }

  removeItem(medium: Medium) {
    console.info('PlaylistComponent@removeItem', medium);

    if (medium === this.current) {
      this.pause();
      this.current = null;

      let player = this.getPlayer();
      player.currentTime = 0;
      player.src = '';
    }

    return this.plManager.removeFromPlaylist(medium, this.playlist)
      .then(num => {
        console.info('removed', num);
        this.ref.detectChanges();
        return num;
      });
  }

  playVideo() {
    if (this.status.video) {
      this.requestFullscreen();
    }
    this.status.video = true;
    this.status.audio = false;

    this.setContentMarginIfVideo();
  }

  playAudio() {
    this.status.video = false;
    this.status.audio = true;

    this.removeContentMargin();
  }

  playItemFirst(item: Medium, seek = 0) {
    if (!this.mediaPlaylist) {
      this.preparePlaylist();
    }

    let index = this.mediaPlaylist.indexOf(item);
    if (index > -1) {
      this.mediaPlaylist.splice(index, 1);
    }

    this.current = item;

    let player = this.getPlayer();
    player.src = this.mediaManager.getUrl(this.current, this.mediaType);

    player.currentTime = seek;

    this.play();
  }

  playItem(item: Medium, seek = 0) {
    this.mediaPlaylist = [].concat(this.playlist.media);

    let index = this.mediaPlaylist.indexOf(item);
    if (index > -1) {
      this.playedPlaylist = this.mediaPlaylist.splice(0, index);
      this.mediaPlaylist.splice(0, 1);
    }

    this.current = item;

    let player = this.getPlayer();
    player.src = this.mediaManager.getUrl(this.current, this.mediaType);

    player.currentTime = seek;

    this.play();
  }

  togglePlay() {
    if (!this.mediaPlaylist) {
      this.preparePlaylist();
    }

    this.status.playing = !this.status.playing;

    let player = this.getPlayer();

    if (!player.src) {
      player.src = this.getNextSrc();
    }

    if (this.status.playing) {
      this.play();
    }
    else {
      this.pause();
    }
  }

  toggleRepeat() {
    this.status.repeat = !this.status.repeat;
  }

  toggleShuffle() {
    if (!this.mediaPlaylist) {
      this.preparePlaylist();
    }
    this.status.shuffle = !this.status.shuffle;
    if (this.status.shuffle) {
      this.shuffle(this.mediaPlaylist);
    }
    else {
      let playlist = [].concat(this.playlist.media);
      if (this.playedPlaylist.length) {
        playlist = playlist.filter(PlaylistComponent.filterPlayed(this.playedPlaylist, this.current));
      }
      if (this.current) {
        playlist.splice(playlist.indexOf(this.current), 1);
      }
      this.mediaPlaylist = playlist;
    }
  }

  requestFullscreen() {
    let elem = <any>this.videoPlayer.nativeElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
    // @todo - disable fullscreen
  }

  isPlaying(item: Medium) {
    return this.current === item;
  }

  wasPlayed(item: Medium) {
    return this.playedPlaylist.indexOf(item) > -1;
  }

  playNext() {
    if (this.current) {
      this.playedPlaylist.push(this.current);
    }

    let nextSrc = this.getNextSrc();

    if (nextSrc) {
      let player = this.getPlayer();

      player.src = nextSrc;

      this.play();
    }
    else {
      this.current = null;
      this.storage.remove('currentMedium');
      this.storage.remove('currentTime');
    }
  }

  playPrev() {
    if (this.current) {
      this.mediaPlaylist.unshift(this.current);
    }

    let prevSrc = this.getPrevSrc();

    if (prevSrc) {
      let player = this.getPlayer();

      player.src = prevSrc;

      this.play();
    }
    else {
      this.current = null;
    }
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

  onSliderFocus(event) {
    this.pause();
  }

  onSliderBlur(event) {
    if (this.current) {
      let player = this.getPlayer();

      if (event.value != player.currentTime) {
        player.currentTime = +event.value;
      }
      this.play();
    }
  }

  open(page: string) {
    this.nav.push(this.pages[page], this.playlist);
  }

  /**
   * @deprecated
   * @param {Playlist} playlist
   */
  private loadPlaylist(playlist: Playlist) {
    this.plManager.selectPlaylist(playlist);
      // .then(media => this.preparePlaylist());
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
            this.playItem(medium, values[2]);
          }
        }
      });
  }

  private onPlayerPlayEnded = (ev: MediaStreamErrorEvent) => {
    this.playNext();
  };

  private onPlayerMetadata = (ev: MediaStreamErrorEvent) => {
    console.info('loadedMetaData', ev, this.videoPlayer.nativeElement.videoWidth, this.videoPlayer.nativeElement.videoHeight, this.contentContainer.contentWidth, this.contentContainer.contentHeight);
    let player = this.getPlayer();
    let aspect = player.videoWidth / player.videoHeight;
    this.video.width = Math.min(player.videoWidth, this.contentContainer.contentWidth);
    this.video.height = this.video.width / aspect;

    let contentHeight = this.contentContainer.contentHeight;
    let halfHeight = contentHeight / 2;
    if (this.video.height > halfHeight) {
      this.video.height = halfHeight;
      this.video.width = aspect * this.video.height;
    }

    // this.video.containerStyle = {width: '100%', height: this.video.height + "px"};

    this.setContentMarginIfVideo();

    this.ref.detectChanges();
  };

  private setContentMarginIfVideo() {
    if (this.status.video && this.video.height) {
      this.contentContainer.getScrollElement().style.marginTop = (this.video.height + this.contentContainer._hdrHeight) + 'px';
    }
  }

  private removeContentMargin() {
    // this.contentContainer.resize();
    this.contentContainer.getScrollElement().style.marginTop = (this.contentContainer._hdrHeight) + 'px';
  }

  private onPlayerProgress = () => {
    let player = this.getPlayer();

    this.currentTime = player.currentTime;
    this.totalTime = player.duration;
    this.storage.set('currentTime', this.currentTime);
    // this.progress.nativeElement.style.left = ((this.currentTime / this.totalTime) * 100) + '%';

    // this.ref.detectChanges();
  };

  private getNextSrc() {
    if (this.mediaPlaylist.length) {
      this.current = this.mediaPlaylist.shift();
      return this.mediaManager.getUrl(this.current, this.mediaType);
    }

    return null;
  }

  private getPrevSrc() {
    if (this.playedPlaylist.length) {
      this.current = this.playedPlaylist.pop();
      return this.mediaManager.getUrl(this.current, this.mediaType);
    }

    return null;
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

  private getPlayer(): HTMLVideoElement { //} | HTMLAudioElement {
    // if (this.playerStatus.video) {
    return this.videoPlayer.nativeElement;
    // }
    // else {
    //   return this.audioPlayer.nativeElement;
    // }
  }

  private static removeItemFrom(item: Medium, arr: Medium[]) {
    let index = arr.indexOf(item);
    if (index > -1) {
      arr.splice(index, 1);
    }
  }
}
