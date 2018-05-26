import {
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter, Input, OnDestroy, Optional, Output,
  ViewChild
} from "@angular/core";
import {Medium} from "../../models/medium";
import {SelectorService} from "../../services/SelectorService";
import {Playlist} from "../../models/playlist";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";
import {Content, ModalController, NavController, NavParams} from "ionic-angular";
import {Storage} from "@ionic/storage";
import {Subscription} from "rxjs/Subscription";
import {WampService} from "../../services/WampService";
import {LibraryPage} from "../../pages/library/library";
import {CloudPage} from "../../pages/cloud/cloud";
import {PlayerService} from "../../services/PlayerService";
import {MediaManagerService} from "../../services/MediaManagerService";
import {ServerManagerService} from "../../services/ServerManagerService";
import {Provider} from "../../models/provider";

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
    all: {
      component: CloudPage,
      title: 'In Cloud',
      provider: null,
      download: false
    }
  };

  components = {
    library: LibraryPage,
    cloud: CloudPage
  };

  hidden = true;

  arrowIcon = 'arrow-up';

  providers: Provider[];

  private subs: Subscription[] = [];

  constructor(
    public selector: SelectorService<Medium>,
    public mediaManager: MediaManagerService,
    private serverManager: ServerManagerService,
    private player: PlayerService,
    private storage: Storage,
    private plManager: PlaylistsManagerService,
    private wamp: WampService,
    private ref: ChangeDetectorRef,
    private modalCtrl: ModalController,
    @Optional() public nav: NavController = null,
    @Optional() private params: NavParams = null
  ) {
    this.player.addChangeDetector(this.ref);

    if (params && params.data.id) {
      this.playlist = params.data;
      this.plManager.selectPlaylist(params.data);
      this.player.setMedia(params.data.media);

      this.subs.push(
        this.wamp.serverSwitched.subscribe(servers => {
          this.nav && this.nav.pop();
        }),
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


    // @todo - is it safe to emit no value ?
    this.contentContainer.ionScrollEnd.emit();
  }

  ngAfterViewInit() {

    if (this.params && !this.params.data.id) {
      this.prepare();
    }

    this.subs.push(
      this.plManager.playlist$.subscribe(playlist => {
        console.info('PlaylistComponent@playlist$', playlist);
        this.playlist = playlist;
        this.selector.clearSelection();
        if (playlist) {
          this.player.setMedia(playlist.media);
        }
        this.ref.detectChanges();
      }),
      this.serverManager.providers$.subscribe(providers => {
        if (providers) {
          this.providers = this.serverManager.getProviders();
        }
      })
    );

    console.info(
      this.header.nativeElement.offsetHeight //.getNativeElement().offsetHeight
    );

  }

  ionViewDidEnter() {
    this.prepare();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

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

  open(page: string, provider?: Provider) {
    let pageOpts = this.pages[page];
    let data;
    let component;

    if (provider) {
      data = {
        playlist: this.playlist,
        title: provider.ionic.title,
        provider: provider.slug,
        download: provider.search
      };
      component = this.components[provider.ionic.component];
    }
    else {
      data = {
        playlist: this.playlist,
        title: pageOpts.title,
        provider: pageOpts.provider,
        download: pageOpts.download
      };
      component = this.pages[page].component;
    }

    this.modalCtrl.create(component, data, {
      cssClass: 'fullscreen-modal mode-color'
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
  }
}
