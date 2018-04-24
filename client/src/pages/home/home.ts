import {ChangeDetectorRef, Component, OnDestroy, ViewChild} from '@angular/core';
import {AlertController, NavController, Select} from 'ionic-angular';
import {AuthService} from "../../services/AuthService";
import {Playlist} from "../../models/playlist";
import {PlaylistsRepository} from "../../repositories/playlists.repository";
import {SearchPage} from "../search/search";
import {Medium} from "../../models/medium";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnDestroy {

  public playlist: Playlist;

  public playlists: Playlist[] = [];

  public media: Medium[] = [];

  private searchPage = SearchPage;

  @ViewChild('playlistSelect') select: Select;

  constructor(
    public navCtrl: NavController,
    // public pages: PagesService,
    private repo: PlaylistsRepository,
    private auth: AuthService,
    private alertCtrl: AlertController,
    private ref: ChangeDetectorRef
  ) {
  }

  ionViewDidLoad() {

    this.repo.playlists$.subscribe(playlists => {
      this.playlists = playlists;
      this.ref.detectChanges();
    });
    this.repo.playlist$.subscribe(playlist => {
      if (playlist) {
        this.playlist = playlist;
        this.onPlaylistChange(playlist);
        // console.info('select playlist', playlist);
      }
      this.ref.detectChanges();
    });

    let user = this.auth.getUser();
    if (user && user.id) {
      this.repo.getPlaylists(user.id)
    }
  }

  goToSearchPage() {
    this.navCtrl.push(this.searchPage);
  }

  onPlaylistChange(playlist) {
    // this.repo.selectPlaylist(playlist);

    this.repo.load(playlist)
      .then(data => {
        this.media = data;
        this.ref.detectChanges();
      })
      .catch(error => { // @todo - error reporting service directly to repository
        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: error.message || 'error occured',
          buttons: ['Ok']
        });

        alert.present();
      });
  }

  ngOnDestroy(): void {
  }
}
