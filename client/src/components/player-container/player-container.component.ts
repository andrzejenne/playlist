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
  // private styleSheet: CSSStyleSheet;

  // private marginIndex: number;

  constructor(private plManager: PlaylistsManagerService,
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
      this.playlist = playlist;
      if (this.playlist) {
        this.title = true;
        this.down = false;
        this.showToolbar();
        this.showPlaylistTitle();
        // console.info(this.footerToolbar.getNativeElement().offsetHeight, this.playlistComponent.header.nativeElement.offsetHeight);
        // let top = 100 - this.playlistComponent.header.nativeElement.offsetHeight / this.playlistContainer.getNativeElement().offsetHeight * 100;
        // this.playlistContainer.getNativeElement().style.top = top + '%';

        // this.elRef.nativeElement.style.borderBottomWidth =
        //   (this.footerToolbar.getNativeElement().offsetHeight + this.playlistComponent.header.nativeElement.offsetHeight) + 'px';
        // console.info(top, '%', this.elRef.nativeElement.style.borderBottom, this.footer.getNativeElement().style);
      }
      else {
        this.hideToolbar();
        this.hidePlaylist();
        this.elRef.nativeElement.style.borderBottomWidth = 0;
      }
      // this.setContentMargin(200);
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
  }

  private showToolbar(el = this.footer.getNativeElement()) {
    el.style.bottom = '0px'; //this.footerToolbar.getNativeElement().offsetHeight + 'px';
  }

  private showPlaylistTitle(el = this.playlistContainer.getNativeElement()) {
    el.style.marginTop = '0px'; //-this.playlistComponent.header.nativeElement.offsetHeight + 'px';
    el.style.top = '100%';

    this.elRef.nativeElement.style.borderBottomWidth =
      (this.footerToolbar.getNativeElement().offsetHeight + this.playlistComponent.header.nativeElement.offsetHeight) + 'px';

  }

  private showPlaylist(el = this.playlistContainer.getNativeElement()) {
    el.style.top = '0';

    this.elRef.nativeElement.style.borderBottomWidth =
      this.footerToolbar.getNativeElement().offsetHeight + 'px';

  }

  private hidePlaylist(el = this.playlistContainer.getNativeElement()) {
    el.style.top = '100%';

    this.elRef.nativeElement.style.borderBottomWidth =
      this.footerToolbar.getNativeElement().offsetHeight + 'px';
  }
}