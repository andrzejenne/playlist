import {ChangeDetectorRef, Component, OnDestroy, ViewChild} from "@angular/core";
import {LibraryManagerService} from "../../services/LibraryManagerService";
import {Album} from "../../models/album";
import {Artist} from "../../models/artist";
import {Genre} from "../../models/genre";
import {ArtistsTab} from "./tabs/artists/artists";
import {AlbumsPage} from "./tabs/albums/albums";
import {GenresTab} from "./tabs/genres/genres";
import {NavController} from "ionic-angular";

@Component({
  selector: 'library-page',
  templateUrl: 'library.html'
})
export class LibraryPage implements OnDestroy {

  artists: Artist[] = [];
  albums: Album[] = [];
  genres: Genre[] = [];

  tab1Root: any;
  tab2Root: any;
  tab3Root: any;

  // @ViewChild('tabs') tabs: Tabs;

  constructor(
    private libManager: LibraryManagerService,
    private ref: ChangeDetectorRef,
    public navCtrl: NavController
  ) {
  }

  ionViewDidLoad() {
    this.libManager.ready()
      .then(
        data => {
          console.info('LibraryPage@ionViewDidLoad', 'libManager@ready', data);
          this.artists = data.artists;
          this.albums = data.albums;
          this.genres = data.genres;

          this.tab1Root = ArtistsTab;
          this.tab2Root = AlbumsPage;
          this.tab3Root = GenresTab;

          console.info(this);

          this.ref.detectChanges();
        }
      )
  }

  ngOnDestroy(): void {
  }
}
