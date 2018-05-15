import {ChangeDetectorRef, Component, OnDestroy, ViewChild} from '@angular/core';
import {Storage} from "@ionic/storage";
import {
  NavController,
  PopoverController,
  ModalController,
  AlertController,
} from 'ionic-angular';
import {AuthService} from "../../services/AuthService";
import {Playlist} from "../../models/playlist";
import {User} from "../../models/user";
import {ServerManagerService} from "../../services/ServerManagerService";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {SettingsPage} from "../settings/settings";
import {SearchPage} from "../search/search";
import {SettingsContract} from "../../services/contracts/SettingsContract";
import {ConfigService} from "../../services/ConfigService";
import {SelectorService} from "../../services/SelectorService";
import {MediaManagerService} from "../../services/MediaManagerService";
import {WampService} from "../../services/WampService";
import {PlaylistsManagerService} from "../../services/PlaylistsManagerService";
import {PlaylistComponent} from "../../components/playlist/playlist.component";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'page-playlists',
  templateUrl: 'playlists.html',
  providers: [SelectorService]
//  providers: [{ provide: PagesService, useExisting: forwardRef(() => PagesService) }],
})
export class PlaylistsPage implements OnDestroy {

  settings: SettingsContract = null;

  playlist: Playlist;

  playlists: Playlist[] = [];

  private user: User;

  private host: string;

  private subs: Subscription[] = [];

  // @ViewChild('playlistSelect') select: Select;

  constructor(
    public navCtrl: NavController,
    public selector: SelectorService<Playlist>,
    //    public pages: PagesService,
    public plManager: PlaylistsManagerService,
    private auth: AuthService,
    private servers: ServerManagerService,
    private wamp: WampService,
    private mediaManager: MediaManagerService,
    private storage: Storage,
    private screenOrientation: ScreenOrientation,
    // private errorReporting: ErrorReporting,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private config: ConfigService,
    private ref: ChangeDetectorRef,
    private nav: NavController
  ) {
    // window.onresize = (ev ) => {
    //   console.info('resize');
    // }
  }

  ionViewDidLoad() {
    if (!this.servers.hasServers()) {
      this.nav.push(SettingsPage);
    }

    this.subs.push(
      this.wamp.connected.subscribe(host => {
        if (host) {
          this.host = host;
          console.info('PlaylistsPage.wamp.connected', host);
          this.auth.getUser(host)
            .then(this.onGetUser);
        }
      }),
      this.plManager.playlist$.subscribe(
        playlist => {
          console.info('PlaylistsPage.plManager.playlist$', playlist);
          // @todo - update playlists count and duration in plManager
          this.ref.detectChanges();
        }
      )
    );

    // this.wamp.disconnected.subscribe(host => {
    //   if (host) {
    //     console.info('PlaylistsPage.wamp.disconnected', host);
    //     if (host == this.host) {
    //       this.pause();
    //       this.media = [];
    //       this.playlist = null;
    //       this.current = null;
    //       this.playedPlaylist = [];
    //       this.mediaPlaylist = [];
    //       this.host = null;
    //       this.plManager.clearPlaylists();
    //       this.ref.detectChanges();
    //     }
    //   }
    // });

    // this.initPlayers();

    // this.screenOrientation.onChange().subscribe(
    //   () => {
    //     console.log("Orientation Changed", this.screenOrientation.type);
    //     if (this.screenOrientation.type.indexOf('portrait') > -1) {
    //       if (this.videoPlayer.nativeElement.webkitDisplayingFullscreen) {
    //         // this.videoPlayer.nativeElement();
    //       }
    //     }
    //     else {
    //       this.requestFullscreen();
    //     }
    //   }
    // );

    // cleanup on server switch
    // this.wamp.serverSwitched.subscribe(servers => {
    //   console.info('PlaylistsPage.serverSwitched', servers);
    //   this.playlist = null;
    //   this.media = [];
    //   this.current = null;
    //   this.playedPlaylist = null;
    //   this.mediaPlaylist = null;
    //   this.ref.detectChanges();
    // });
  }

  goToSearchPage() {
    this.navCtrl.push(SearchPage);
  }

  goToSettingsPage() {
    this.navCtrl.push(SettingsPage);
  }

  onPlaylistChange(playlist: Playlist) {
    this.plManager.selectPlaylist(playlist);

    this.storage.set('playlist', playlist.id);
  }


  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  removePlaylist(playlist: Playlist) {
    this.plManager.remove(playlist);
  }

  createPlaylist($event) {
    this.alertCtrl.create({
      title: 'New Playlist',
      inputs: [
        {
          label: 'Name',
          name: 'name',
          placeholder: 'The Playlist'
        }
      ],
      buttons: [
        {
          text: 'Create',
          handler: data => {
            if (data.name) {
              this.plManager.create(this.user, data.name);
            }
          }
        }
      ]
    }).present({ev: $event});
  }

  removeSelected($event) {
    let actions = [];
    this.selector.selected.forEach(playlist => {
      actions.push(
        this.plManager.remove(playlist)
          .then(num => {
            let index = this.playlists.indexOf(playlist);

            this.selector.toggleSelect(playlist);
            if (index > -1) {
              this.playlists.splice(index, 1);
            }
          })
      );
    });

    Promise.all(actions)
      .then(ready => this.ref.detectChanges());
  }

  openPlaylist(playlist: Playlist) {
    // this.playlist = playlist;
    this.navCtrl.push(PlaylistComponent, playlist);
    // this.modalCtrl.create(PlaylistComponent, playlist).present();
  }

  openPlaylistModal(playlist: Playlist) {
    this.modalCtrl.create(PlaylistComponent, playlist, {
      showBackdrop: false
    }).present();
  }

  private onGetUser = (user: User) => {
    this.user = user;
    console.info('PlaylistsPage.onGetUser', user);
    if (user) {
      this.storage.get('playlist')
        .then(playlistId => {
          this.plManager.list(user)
            .then(playlists => this.playlists = playlists);
        });

      this.settings = this.config.settings;

      // this.plManager.playlist$.subscribe(playlist => {
      //   if (playlist && playlist.media) {
      //     this.media = playlist.media;
      //     if (!this.playlist) {
      //       this.preparePlaylist();
      //       if (this.settings.player.autoplay.lastPosition) {
      //         this.autoPlayIfInterrupted();
      //       }
      //     }
      //     else {
      //       this.preparePlaylistDiff();
      //     }
      //     this.playlist = playlist;
      //     this.ref.detectChanges();
      //   }
      // });
    }
  };
}
