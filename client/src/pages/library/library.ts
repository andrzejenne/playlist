import {ChangeDetectorRef, Component, OnDestroy, ViewChild} from "@angular/core";
import {LibraryManagerService} from "../../services/LibraryManagerService";
import {Album} from "../../models/album";
import {Artist} from "../../models/artist";
import {Genre} from "../../models/genre";
import {ArtistsTab} from "./tabs/artists/artists";
import {AlbumsPage} from "./tabs/albums/albums";
import {GenresTab} from "./tabs/genres/genres";
import {NavController, Tabs} from "ionic-angular";

@Component({
  selector: 'library-page',
  templateUrl: 'library.html'
})
export class LibraryPage implements OnDestroy {

  artists: Artist[] = [];
  albums: Album[] = [];
  genres: Genre[] = [];

  tab1Root = ArtistsTab;
  tab2Root = AlbumsPage;
  tab3Root = GenresTab;

  // @ViewChild('tabs') tabs: Tabs;

  constructor(private libManager: LibraryManagerService, private ref: ChangeDetectorRef, public navCtrl: NavController) {
  }

  ionViewDidLoad() {
    this.libManager.ready().then(
      data => {
        console.info('LibraryPage@ionViewDidLoad', 'libManager@ready', data);
        this.artists = data.artists;
        this.albums = data.albums;
        this.genres = data.genres;

        this.ref.detectChanges();
      }
    )
  }

  ngOnDestroy(): void {
  }

}
