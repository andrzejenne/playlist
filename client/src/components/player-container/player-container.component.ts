import {
  AfterContentInit, AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild, ElementRef,
  HostBinding, OnChanges, SimpleChanges, ViewChild
} from "@angular/core";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";
import {PlayerControlsComponent} from "../player-controls/player-controls.component";
import {Content, Footer, Nav, Toolbar} from "ionic-angular";
import {Playlist} from "../../models/playlist";
import {PlaylistComponent} from "../playlist/playlist.component";
import {Medium} from "../../models/medium";
import {Storage} from "@ionic/storage";

@Component({
  selector: 'player-container',
  templateUrl: 'player-container.component.html'
})
export class PlayerContainerComponent implements AfterViewInit, AfterContentInit, OnChanges {
  @HostBinding('class.hide-player')
  hidden: boolean = true;

  @HostBinding('class.open')
  open: boolean = false;

  @HostBinding('class.down')
  down: boolean = true;

  @HostBinding('class.title')
  title: boolean = false;

  @ViewChild(PlayerControlsComponent) playerControls: PlayerControlsComponent;
  @ContentChild(Nav) nav: Nav;

  @ViewChild(Content) playlistContainer: Content;
  @ViewChild(PlaylistComponent) playlistComponent: PlaylistComponent;
  @ViewChild(Footer) footer: Footer;
  @ViewChild(Toolbar) footerToolbar: Toolbar;

  playlist: Playlist;

  status: {
    currentTime: number;
    shuffle: boolean;
    repeat: boolean;
    playing: boolean;
    video: boolean;
    audio: boolean;
  } = {
    currentTime: 0,
    shuffle: false,
    repeat: false,
    playing: false,
    video: false,
    audio: true
  };

  video: {
    width: number;
    height: number;
  } = {
    width: 0,
    height: 0
  };
  // private styleSheet: CSSStyleSheet;

  // private marginIndex: number;

  constructor(private plManager: PlaylistsManagerService,
              private storage: Storage,
              private elRef: ElementRef,
              private ref: ChangeDetectorRef) {
    this.hidden = plManager.playlist === null;

    // let style = document.head.appendChild(
    //   document.createElement('style')
    // );

    // this.styleSheet = <CSSStyleSheet>this.style.sheet;
  }

  ngAfterViewInit() {
    this.hideToolbar();

    this.plManager.playlist$.subscribe(playlist => {
      this.hidden = playlist === null;
      if (this.playlist !== playlist) {
        this.playlist = playlist;
        if (this.playlist) {
          this.title = true;
          this.down = false;
          this.showToolbar();
          this.showPlaylistTitle();
        }
        else {
          this.hideToolbar();
          this.hidePlaylist();
        }
        // this.setContentMargin(200);
      }
      this.ref.detectChanges();
    });

  }

  ngAfterContentInit(): void {

  }


  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['playlist']) {

    // }
  }

  hide(event) {
    console.info('PlayerContainerComponent@hide', event);
    if (event) {
      this.open = false;
      this.hidden = true;
      this.showPlaylistTitle();
    }
    else {
      this.open = true;
      this.hidden = false;
      this.showPlaylist();
    }
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

  playFirst(item: Medium, seek = 0) {
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

  // setContentMargin(margin: number) {
  //   this.marginIndex = this.styleSheet.insertRule('player-container ion-content { margin-top: ' + margin + 'px;', this.marginIndex || null);
  // }
  //
  // private initStyles() {
  //   this.styleSheet.insertRule('player-container ion-content { transition: margin 5s ease-in-out; }');
  //   this.styleSheet.insertRule('player-container.hide-player ion-content { margin-top: 0; }');
  // }

  private hideToolbar(el = this.footer.getNativeElement()) {
    el.style.top = 'auto';
    el.style.bottom = '-' + this.footerToolbar.getNativeElement().offsetHeight + 'px';
    this.elRef.nativeElement.style.borderBottomWidth = 0;
  }

  private showToolbar(el = this.footer.getNativeElement()) {
    el.style.bottom = '0px'; //this.footerToolbar.getNativeElement().offsetHeight + 'px';
    this.elRef.nativeElement.style.borderBottomWidth = this.footerToolbar.getNativeElement().offsetHeight + 'px';
  }

  private showPlaylistTitle(el = this.playlistContainer.getNativeElement()) {
    el.style.marginTop = '0px'; //-this.playlistComponent.header.nativeElement.offsetHeight + 'px';
    el.style.top = '100%';

    this.elRef.nativeElement.style.borderBottomWidth =
      (this.footerToolbar.getNativeElement().offsetHeight + this.playlistComponent.header.nativeElement.offsetHeight) + 'px';

  }

  private showPlaylist(el = this.playlistContainer.getNativeElement()) {
    el.style.top = '0';

    this.elRef.nativeElement.style.borderBottomWidth = 0;
      // this.footerToolbar.getNativeElement().offsetHeight + 'px';

  }

  private hidePlaylist(el = this.playlistContainer.getNativeElement()) {
    el.style.top = '100%';

    this.elRef.nativeElement.style.borderBottomWidth = 0;
      // this.footerToolbar.getNativeElement().offsetHeight + 'px';
  }

  private setContentMarginIfVideo() {
    if (this.status.video && this.video.height) {
      this.contentContainer.getScrollElement().style.marginTop = (this.video.height + this.contentContainer._hdrHeight) + 'px';
    }
  }

  private removeContentMargin() {
    // this.contentContainer.resize();
    this.contentContainer.getScrollElement().style.marginTop = (this.contentContainer._hdrHeight) + 'px';
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
}