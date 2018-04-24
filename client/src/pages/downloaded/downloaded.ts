import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {AlertController, NavController} from 'ionic-angular';
import {AuthService} from "../../services/AuthService";
import {Playlist} from "../../models/playlist";
import {DownloadedRepository} from "../../repositories/downloaded.repository";
import {Medium} from "../../models/medium";
import {PlaylistsRepository} from "../../repositories/playlists.repository";

@Component({
    selector: 'page-downloaded',
    templateUrl: 'downloaded.html'
})
export class DownloadedPage implements OnDestroy {

    downloaded: any;

    playlist: Playlist;

    public playlists: Playlist[] = [];

    constructor(
        public navCtrl: NavController,
        private repo: DownloadedRepository,
        private plRepo: PlaylistsRepository,
        private auth: AuthService,
        private alertCtrl: AlertController,
        private ref: ChangeDetectorRef
    ) {

    }

    ionViewDidLoad() {
        let user = this.auth.getUser();
        if (user && user.id) {
            this.repo.list()
                .then(data => {
                    this.downloaded = data;
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

    addToPlaylist(item: Medium) {
      this.plRepo.addToPlaylist(item)
        .then(result => result);
// .then(
      // @todo - info, added to playlist
    }

    getThumbnail(item: Medium) {
        for(let i = 0; i < item.files.length; i++){
            if ('thumbnail' === item.files[i].type.slug) {
                return item.files[i];
            }
        }

        return null;
    }

    getThumbnailUrl(item: Medium) {
        let thumb = this.getThumbnail(item);
        if (thumb) {
            return this.getUrl(item, thumb);
        }

        return null;
    }

    ngOnDestroy(): void {
    }

    getUrl(item: Medium, file: any) {
        return 'http://localhost:8000/media/' + item.provider.slug +'/' + item.provider_sid[0] + item.provider_sid[1] + '/' + item.provider_sid[2] + item.provider_sid[3] + '/' + file.filename;
    }
}
