import {ChangeDetectorRef, Component, OnDestroy, ViewChild} from '@angular/core';
import {Storage} from "@ionic/storage";
import {Content, NavController, Select, PopoverController} from 'ionic-angular';
import {AuthService} from "../../services/AuthService";
import {Playlist} from "../../models/playlist";
import {PlaylistsRepository} from "../../repositories/playlists.repository";
import {Medium} from "../../models/medium";
import {ElementReference} from "../../models/ElementReference";
import {User} from "../../models/user";
import {ServerManagerService} from "../../services/ServerManagerService";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {SettingsPage} from "../settings/settings";
import {SearchPage} from "../search/search";
import {AddPlaylistComponent} from "./playlist/add-playlist.component";
import {SettingsContract} from "../../services/contracts/SettingsContract";
import {ConfigService} from "../../services/ConfigService";
import {SelectorService} from "../../services/SelectorService";

//import {PagesService} from "../../services/PagesService";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [SelectorService]
//  providers: [{ provide: PagesService, useExisting: forwardRef(() => PagesService) }],
})
export class HomePage implements OnDestroy {

  public playlist: Playlist;

  public media: Medium[] = [];

  public mediaPlaylist: Medium[];

  public current: Medium;

  public playerStatus = {
    shuffle: false,
    repeat: false,
    playing: false,
    video: false,
    audio: true,
  };

  public settings: SettingsContract = null;

  playIcon: string = 'play';

  mediaType: string = 'audio';

  currentTime: number = 0;
  totalTime: number = 0;

  playedPlaylist: Medium[];

  @ViewChild('content') contentContainer: Content;

  video: {
    width: number;
    height: number;
    containerStyle: any;
  } = {
    width: 0,
    height: 0,
    containerStyle: {width: '100%'}
  };

  public playlistTools: boolean = false;

  private interval: number;

  private user: User;

  @ViewChild('playlistSelect') select: Select;

  @ViewChild('audioPlayer') audioPlayer: ElementReference<HTMLAudioElement>;
  @ViewChild('videoPlayer') videoPlayer: ElementReference<HTMLVideoElement>;

  @ViewChild('progress') progress: ElementReference<HTMLDivElement>;

  constructor(
    public navCtrl: NavController,
    public selector: SelectorService<Medium>,
    //    public pages: PagesService,
    private repo: PlaylistsRepository,
    private auth: AuthService,
    private servers: ServerManagerService,
    private storage: Storage,
    private screenOrientation: ScreenOrientation,
    // private errorReporting: ErrorReporting,
    private popoverCtrl: PopoverController,
    private config: ConfigService,
    private ref: ChangeDetectorRef,
  ) {
    // window.onresize = (ev ) => {
    //   console.info('resize');
    // }
  }

  ionViewDidLoad() {
    this.auth.getUser()
      .then(this.onGetUser);

    this.initPlayers();

    this.screenOrientation.onChange().subscribe(
      () => {
        console.log("Orientation Changed", this.screenOrientation.type);
        if (this.screenOrientation.type.indexOf('portrait') > -1) {
          if (this.videoPlayer.nativeElement.webkitDisplayingFullscreen) {
            // this.videoPlayer.nativeElement();
          }
        }
        else {
          this.requestFullscreen();
        }
      }
    );
  }

  onItemSwipe(item: Medium, event: WheelEvent) {
    if (event.deltaX > 0) {
      this.playItemFirst(item);
    }
    else if (event.deltaX < 0) {
      this.removeItem(item);
    }
    // console.info('item swipe', event);
  }


  goToSearchPage() {
    this.navCtrl.push(SearchPage);
  }

  goToSettingsPage() {
    this.navCtrl.push(SettingsPage);
  }

  onPlaylistChange(playlist: Playlist) {
    this.repo.selectPlaylist(playlist);

    this.storage.set('playlist', playlist.id);
  }

  removeItem(medium: Medium) {
    if (medium === this.current) {
      this.pause();
      this.current = null;

      let player = this.getPlayer();
      player.currentTime = 0;
      player.src = '';
    }

    return this.repo.removeFromPlaylist(medium, this.playlist)
      .then(num => {
        this.ref.detectChanges();
        return num;
      });
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

  playVideo() {
    if (this.playerStatus.video) {
      this.requestFullscreen();
    }
    this.playerStatus.video = true;
    this.playerStatus.audio = false;

    this.setContentMarginIfVideo();
  }

  playAudio() {
    this.playerStatus.video = false;
    this.playerStatus.audio = true;

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
    player.src = this.servers.getUrl(this.current, this.mediaType);

    player.currentTime = seek;

    this.play();
  }

  playItem(item: Medium, seek = 0) {
    this.mediaPlaylist = [].concat(this.media);

    let index = this.mediaPlaylist.indexOf(item);
    if (index > -1) {
      this.playedPlaylist = this.mediaPlaylist.splice(0, index);
      this.mediaPlaylist.splice(0, 1);
    }

    this.current = item;

    let player = this.getPlayer();
    player.src = this.servers.getUrl(this.current, this.mediaType);

    player.currentTime = seek;

    this.play();
  }

  togglePlay() {
    if (!this.mediaPlaylist) {
      this.preparePlaylist();
    }

    this.playerStatus.playing = !this.playerStatus.playing;

    let player = this.getPlayer();

    if (!player.src) {
      player.src = this.getNextSrc();
    }

    if (this.playerStatus.playing) {
      this.play();
    }
    else {
      this.pause();
    }
  }

  toggleRepeat() {
    this.playerStatus.repeat = !this.playerStatus.repeat;
  }

  toggleShuffle() {
    if (!this.mediaPlaylist) {
      this.preparePlaylist();
    }
    this.playerStatus.shuffle = !this.playerStatus.shuffle;
    if (this.playerStatus.shuffle) {
      this.shuffle(this.mediaPlaylist);
    }
    else {
      let playlist = [].concat(this.media);
      if (this.playedPlaylist.length) {
        playlist = playlist.filter(HomePage.filterPlayed(this.playedPlaylist, this.current));
      }
      if (this.current) {
        playlist.splice(playlist.indexOf(this.current), 1);
      }
      this.mediaPlaylist = playlist;
    }
  }

  onSliderChange(event) {
    // console.info('slide change', event);
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

  ngOnDestroy(): void {
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

  getThumbnailUrl(item: Medium) {
    let thumb = this.getThumbnail(item);
    if (thumb) {
      return this.servers.getFileUrl(item, thumb) + '?get';
    }

    return null;
  }

  removeSelected() {
    let removed = [];
    this.selector.selected
      .forEach(
        item => removed.push(this.removeItem(item)
        )
      );

    return Promise.all(removed)
      .then(val => this.selector.clearSelection());
  }

  onPlaylistAddClick(ev) {
    this.popoverCtrl.create(AddPlaylistComponent)
      .present({ev: ev});

  }

  removePlaylist(playlist: Playlist) {
    this.repo.remove(playlist);
  }

  private getThumbnail(item: Medium) {
    for (let i = 0; i < item.files.length; i++) {
      if ('thumbnail' === item.files[i].type.slug) {
        return item.files[i];
      }
    }

    return null;
  }

  private getNextSrc() {
    if (this.mediaPlaylist.length) {
      this.current = this.mediaPlaylist.shift();
      return this.servers.getUrl(this.current, this.mediaType);
    }

    return null;
  }

  private getPrevSrc() {
    if (this.playedPlaylist.length) {
      this.current = this.playedPlaylist.pop();
      return this.servers.getUrl(this.current, this.mediaType);
    }

    return null;
  }

  private preparePlaylist() {
    this.mediaPlaylist = [].concat(this.media);
    this.playedPlaylist = [];
    if (this.playerStatus.shuffle) {
      this.shuffle(this.mediaPlaylist);
    }
  }

  private preparePlaylistDiff() {
    this.mediaPlaylist.splice(0, this.mediaPlaylist.length);
    this.mediaPlaylist.push(...this.media);
    this.playedPlaylist = [];
  }

  private playStatus() {
    this.playIcon = this.playerStatus.playing ? 'pause' : 'play';
  }

  private play() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.playerStatus.playing = true;

    let player = this.getPlayer();

    player.play();

    this.interval = setInterval(this.onPlayerProgress, 100);

    this.playStatus();

    this.storage.set('currentMedium', this.current.id);
  }

  private pause() {
    clearInterval(this.interval);

    this.playerStatus.playing = false;
    this.getPlayer().pause();

    this.playStatus();
  }

  private shuffle(arr: any[]) {
    arr.sort(HomePage.shuffleCallback);
  }

  private initPlayers() {
    this.videoPlayer.nativeElement.onended = this.onPlayerPlayEnded;
    this.videoPlayer.nativeElement.onloadedmetadata = this.onPlayerMetadata;
    // this.audioPlayer.nativeElement.onended = this.onPlayerPlayEnded;
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
          let medium = this.media.filter(item => item.id == values[1])[0];
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

    this.video.containerStyle = {width: '100%', height: this.video.height + "px"};

    this.setContentMarginIfVideo();

    this.ref.detectChanges();
  };

  private setContentMarginIfVideo() {
    if (this.playerStatus.video && this.video.height) {
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

  private onGetUser = (user: User) => {
    this.user = user;

    this.storage.get('playlist')
      .then(playlistId => {
        this.repo.getPlaylists(user.id, playlistId);
      });

    this.config.settings$.subscribe(settings => {
        this.settings = settings;

        this.repo.playlist$.subscribe(playlist => {
          if (playlist && playlist.media) {
            this.media = playlist.media;
            if (!this.playlist) {
              this.preparePlaylist();
              if (this.settings.player.autoplay.lastPosition) {
                this.autoPlayIfInterrupted();
              }
            }
            else {
              this.preparePlaylistDiff();
            }
            this.playlist = playlist;
            this.ref.detectChanges();
          }
        });
      }
    );


  };

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

}
