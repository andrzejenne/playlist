import {ChangeDetectorRef, Component, OnDestroy, ViewChild} from '@angular/core';
import {AlertController, NavController, Select} from 'ionic-angular';
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

    public media: any[] = [];

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
        let user = this.auth.getUser();
        if (user && user.id) {
            this.repo.list(user.id)
                .then(data => {
                    this.playlists = data;
                    if (data.length) {
                        this.select.setValue(data[0]);
                        // this.playlistId = data[0].id;
                    }
                    this.ref.detectChanges();
                })
                .catch(error => { // @todo - error reporting service directly to repository
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

    onPlaylistChange(playlist) {
        this.repo.load(playlist)
            .then(data => this.media = data)
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
