import {ChangeDetectorRef, Component, Input, OnDestroy, ViewChild} from "@angular/core";
import {LibraryManagerService} from "../../services/LibraryManagerService";
import {Album} from "../../models/album";
import {Artist} from "../../models/artist";
import {Genre} from "../../models/genre";
import {ArtistsTab} from "./tabs/artists/artists";
import {AlbumsTab} from "./tabs/albums/albums";
import {GenresTab} from "./tabs/genres/genres";
import {NavController, NavParams, Tabs, ViewController} from "ionic-angular";
import {Playlist} from "../../models/playlist";

@Component({
  selector: 'library-page',
  templateUrl: 'library.html'
})
export class LibraryPage implements OnDestroy {

  artistsCount: number = 0;
  albumsCount: number = 0;
  genresCount: number = 0;

  tab1Root: any;
  tab2Root: any;
  tab3Root: any;

  @Input()
  playlist: Playlist;

  @ViewChild('tabs') tabs: Tabs;

  constructor(
    public libManager: LibraryManagerService,
    public navCtrl: NavController,
    private ref: ChangeDetectorRef,
    private viewCtrl: ViewController,
    params: NavParams
  ) {
    if (params.data.playlist) {
      this.playlist = <Playlist>params.data.playlist;
    }
  }

  ionViewDidLoad() {

    this.libManager.ready()
      .then(
        data => {
          console.info('LibraryPage@ionViewDidLoad', 'libManager@ready', data);
          this.artistsCount = data.artistsCount;
          this.albumsCount = data.albumsCount;
          this.genresCount = data.genresCount;

          this.tab1Root = ArtistsTab;
          this.tab2Root = AlbumsTab;
          this.tab3Root = GenresTab;

          this.ref.detectChanges();
        }
      )
  }

  ionViewDidEnter() {
    this.tabs.select(1);
  }

  ngOnDestroy(): void {
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
