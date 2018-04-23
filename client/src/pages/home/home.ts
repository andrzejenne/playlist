import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {AlertController, NavController} from 'ionic-angular';
import {AuthService} from "../../services/AuthService";
import {Playlist} from "../../models/playlist";
import {PlaylistsRepository} from "../../repositories/playlists.repository";
import {SearchPage} from "../search/search";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage implements OnDestroy {



    playlist: Playlist;

    public playlists: Playlist[] = [];

    private searchPage = SearchPage;

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
        let user = this.auth.getUser();
        if (user && user.id) {
            this.repo.list(user.id)
                .then(data => {
                    this.playlists = data;
                    this.ref.detectChanges();
                })
                .catch(error => {
                    let alert = this.alertCtrl.create({
                        title: 'Error!',
                        subTitle: error.message || 'error occured',
                        buttons: ['Ok']
                    });

                    alert.present();
                })
        }
    }

    goToSearchPage() {
        this.navCtrl.push(this.searchPage);
    }

    ngOnDestroy(): void {
    }
}
