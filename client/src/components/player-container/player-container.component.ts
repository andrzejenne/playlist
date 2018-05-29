import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild, ElementRef,
  HostBinding, Input, OnChanges, SimpleChanges, ViewChild
} from "@angular/core";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";
import {PlayerControlsComponent} from "../player-controls/player-controls.component";
import {Content, Footer, Nav, Toolbar} from "ionic-angular";
import {Playlist} from "../../models/playlist";
import {PlaylistComponent} from "../playlist/playlist.component";
// import {Storage} from "@ionic/storage";
import {PlayerService} from "../../services/PlayerService";
import {ElementReference} from "../../models/ElementReference";

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

  @ViewChild('playlist') playlistContainer: Content;
  @ViewChild(PlaylistComponent) playlistComponent: PlaylistComponent;
  @ViewChild(Footer) footer: Footer;
  @ViewChild(Toolbar) footerToolbar: Toolbar;
  @ViewChild('videoPlayerEl') videoPlayerRef: ElementReference<HTMLVideoElement>;
  @ViewChild('audioPlayerEl') audioPlayerRef: ElementReference<HTMLAudioElement>;

  @Input()
  bottomMargin: number;

  currentBottomMargin: number;

  playlist: Playlist;

  // private styleSheet: CSSStyleSheet;

  // private marginIndex: number;
  constructor(
    public player: PlayerService,
    private plManager: PlaylistsManagerService,
    // private storage: Storage,
    private elRef: ElementRef,
    private ref: ChangeDetectorRef) {
    this.hidden = plManager.playlist === null;

    // debugger;
    // let style = document.head.appendChild(
    //   document.createElement('style')
    // );

    // this.styleSheet = <CSSStyleSheet>this.style.sheet;
  }

  ngAfterViewInit() {
    this.hideToolbar();
    this.player.setPlayerElements(this.videoPlayerRef.nativeElement, this.audioPlayerRef.nativeElement)
      .addChangeDetector(this.ref)
      .setContent(this.playlistContainer);

    this.plManager.playlist$.subscribe(playlist => {
      this.hidden = playlist === null;
      if (this.playlist !== playlist) {
        this.playlist = playlist;
        if (this.playlist) {
          this.player.setMedia(this.playlist.media);
          this.title = true;
          this.down = false;
          this.showToolbar();
          this.showPlaylistTitle();
        }
        else {
          this.player.setMedia();
          if (!this.player.medium) {
            this.hideToolbar();
          }
          this.hidePlaylist();
        }
        // this.setContentMargin(200);
      }
      this.ref.detectChanges();
    });

    this.player.medium$.subscribe(media => {
      if (!this.playlist) {
        if (media) {
          this.hidden = false;
          this.title = false;
          this.down = false;
          this.showToolbar();
          // this.showPlaylistTitle();
        }
        else {
          this.hidden = true;
          this.title = false;
          this.down = false;
          this.hideToolbar();
          // this.hidePlaylist();
        }
      }
    });

  }

  ngAfterContentInit(): void {

  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bottomMargin']) {
      this.setBottomMargin(changes['bottomMargin'].currentValue || 0);
    }
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
    this.currentBottomMargin = 0;

    this.setBottomMargin();
  }

  private showToolbar(el = this.footer.getNativeElement()) {
    el.style.bottom = '0px'; //this.footerToolbar.getNativeElement().offsetHeight + 'px';
    this.currentBottomMargin = this.footerToolbar.getNativeElement().offsetHeight;

    this.setBottomMargin();
  }

  private showPlaylistTitle(el = this.playlistContainer.getNativeElement()) {
    el.style.marginTop = '0px'; //-this.playlistComponent.header.nativeElement.offsetHeight + 'px';
    el.style.top = '100%';

    this.currentBottomMargin = (this.footerToolbar.getNativeElement().offsetHeight + this.playlistComponent.header.nativeElement.offsetHeight);

    this.setBottomMargin();
  }

  private showPlaylist(el = this.playlistContainer.getNativeElement()) {
    el.style.top = '0';

    this.currentBottomMargin = 0;

    this.setBottomMargin();
  }

  private hidePlaylist(el = this.playlistContainer.getNativeElement()) {
    el.style.top = '100%';

    this.currentBottomMargin = 0;

    this.setBottomMargin();
    // this.footerToolbar.getNativeElement().offsetHeight + 'px';
  }

  private setBottomMargin(margin = this.bottomMargin) {
    this.elRef.nativeElement.style.borderBottomWidth = (this.currentBottomMargin + margin) + 'px';
  }
}
