import {
  AfterContentInit, AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  HostBinding
} from "@angular/core";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";
import {PlayerControlsComponent} from "../player-controls/player-controls.component";
import {Nav} from "ionic-angular";

@Component({
  selector: 'player-container',
  templateUrl: 'player-container.component.html'
})
export class PlayerContainerComponent implements AfterViewInit {
  @HostBinding('class.hide-player')
  hidden: boolean;

  @ContentChild(PlayerControlsComponent) playerControls: PlayerControlsComponent;
  @ContentChild(Nav) nav: Nav;

  private style: HTMLStyleElement;

  private styleSheet: CSSStyleSheet;

  private marginIndex: number;

  constructor(private plManager: PlaylistsManagerService, private ref: ChangeDetectorRef) {
    this.hidden = plManager.playlist === null;

    this.style = document.head.appendChild(
      document.createElement('style')
    );

    this.styleSheet = <CSSStyleSheet>this.style.sheet;
  }

  ngAfterViewInit() {
    this.plManager.playlist$.subscribe(playlist => {
      this.hidden = playlist === null;
      this.setContentMargin(200);
      this.ref.detectChanges();
    });

    this.initStyles();
  }

  setContentMargin(margin: number) {
    this.marginIndex = this.styleSheet.insertRule('player-container ion-content { margin-top: ' + margin + 'px;', this.marginIndex || null);
  }

  private initStyles() {
    this.styleSheet.insertRule('player-container ion-content { transition: margin 5s ease-in-out; }');
    this.styleSheet.insertRule('player-container.hide-player ion-content { margin-top: 0; }');
  }
}