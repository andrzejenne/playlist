import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {AlertController, NavController} from 'ionic-angular';
import {Subscription} from "rxjs/Subscription";
import {SearchRepository} from "../../repositories/search.repository";
import {SearchItem} from "../../models/search-item";
import {Search} from "../../models/search";
import {WampService} from "../../services/WampService";
import {AuthService} from "../../services/AuthService";
import {ItemInterface} from "./item.interface";
import {DownloadedRepository} from "../../repositories/downloaded.repository";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage implements OnDestroy {

    public search: string;

    public history: Search[] = [];

    public list: SearchItem[] = [];

    public focused = false;

    public userData;

    public nextPageToken: string;

    public prevPageToken: string;

    public downloads: ItemInterface[] = [];

    public downloadedMedia: any[] = [];

    private allHistory: Search[];

    private subs: Subscription[] = [];

    private iwamp: number;

    constructor(
        public navCtrl: NavController,
        private repo: SearchRepository,
        private downloaded: DownloadedRepository,
        private wamp: WampService,
        private auth: AuthService,
        private alertCtrl: AlertController,
        private ref: ChangeDetectorRef
    ) {
        this.subs.push(this.wamp.subscribe(session => this.subscribeWamp()));

        this.userData = this.auth.getUser();
    }

    public onSearchClick() {
        console.info('onSearchClick');
        this.searchItems();
    }

    public onDownloadedClick() {
      this.downloaded.list().then(data => {
        this.downloadedMedia = <any[]>data;
        this.ref.detectChanges();
      });
    }

    public onLogoutClick() {
        this.auth.logout();
    }

    public onNextClick() {
        this.searchItems(null, {pageToken: this.nextPageToken})
    }

    public onPrevClick() {
        this.searchItems(null, {pageToken: this.prevPageToken})
    }

    public getSearchHistory() {
        console.info('getSearchHistory');

        this.repo.getSearchHistory(+this.userData.id)
            .then(response => {
                this.allHistory = response;
                this.filterHistory();
                this.ref.detectChanges();
            });
    }

    public removeSearchHistory(event: MouseEvent, item: Search) {
        event.preventDefault();
        event.stopPropagation();

        this.repo.removeSearchHistory(item.id)
            .then(response => {
                this.removeSearchHistoryItem(item);
                this.ref.detectChanges();
            });
    }

    public getInfo(event: MouseEvent, item: SearchItem) {
        this.repo.getInfo(item.sid)
            .then(response => console.info(response))
    }

    public download(event: MouseEvent, item: SearchItem) {
        if (!this.isDownloading(item.sid)) {
            this.downloads.push({
                sid: item.sid,
                title: item.title,
                thumbnail: item.thumbnail,
                started: false,
                finished: false,
                files: [],
                status: []
            });

            this.repo.download(this.userData.id, item.sid)
                .then(response => console.info(response))
        }
    }

    public searchItems(query?: string, args?: any) {
        console.info('searchItems');

        if (query) {
            this.search = query;
        }

        this.history = [];

        if (this.search && this.search.length) {
            this.repo.search(+this.userData.id, this.search, args || {})
                .then(response => {
                    this.list = response.items;
                    console.info('response', response);
                    this.nextPageToken = response.next;
                    this.prevPageToken = response.prev;
                    this.ref.detectChanges();
                })
        }
        else {
            this.list = [];
            this.ref.detectChanges();
        }
    }

    public ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());

        this.unsubscribeWamp();
    }

    private filterHistory() {
        if (this.search) {
            this.history = this.allHistory.filter(item => -1 !== item.query.indexOf(this.search));
        }
        else {
            this.history = [].concat(this.allHistory);
        }
    }

    private removeSearchHistoryItem(item: Search) {
        let ia = this.allHistory.indexOf(item);
        let i = this.history.indexOf(item);
        if (-1 != ia) {
            this.allHistory.splice(ia, 1);
        }
        if (-1 != i) {
            this.history.splice(i, 1);
        }
    }

    private subscribeWamp() {
        this.iwamp = this.wamp.register(this.wampCommands);
    }

    private unsubscribeWamp() {
        this.wamp.unregister(this.iwamp);
    }

    private wampCommands = {
        coms: {
            'com.hello.world.cli': () => {
                console.info('HELLO WORLD');
            }
        },
        subs: {
            'sub.say.hi.cli': (data) => {
                console.info('HI', data);
            },
            'sub.download.started': (data) => {
                let item = this.getDownloading(data[0].url);

                item.started = true;
                this.ref.detectChanges();
                console.info('Download started:', data);
            },
            'sub.download.progress': (data) => {
                let file = this.getDownloadingFile(data[0].url, data[0].filename);

                file.progress = data[0].progress;
                this.ref.detectChanges();
                console.info('Download progress:', data);
            },
            'sub.download.finished': (data) => {
                let item = this.getDownloading(data[0].url);

                item.finished = true;
                this.ref.detectChanges();
                console.info('Download finished:', data);
            },
            'sub.download.error': (data) => {
                console.info('Download error:', data);
            },
            'sub.download.status': (data) => {
                let item = this.getDownloading(data[0].url);

                item.status.push(data[0].status);
                this.ref.detectChanges();

                console.info('Download status:', data);
            },
            'sub.download.filename': (data) => {
                let item = this.getDownloading(data[0].url);
                item.files.push({
                    name: data[0].filename,
                    progress: 0
                });

                this.ref.detectChanges();
                console.info('Download filename:', data);
            },
            'sub.error': (data) => {
                console.info('WampError: ', data);
                this.alertCtrl.create({
                    title: 'WampError',
                    subTitle: data[0].message,
                    buttons: ['OK']
                });
            }
        }
    };

    private isDownloading(sid: string) {
        return this.getDownloading(sid) !== null;
    }

    private getDownloading(sid: string) {
        let item = this.downloads.find(item => item.sid === sid) || null;

        return item;
    }

    private getDownloadingFile(sid: string, filename: string) {
        let item = this.getDownloading(sid);
        if (item) {
            return item.files.find(file => file.name === filename) || null;
        }

        return null;
    }

    getUrl(item: any, file: any) {
      return 'http://localhost:8000/media/' + item.provider.slug +'/' + item.provider_sid[0] + item.provider_sid[1] + '/' + item.provider_sid[2] + item.provider_sid[3] + '/' + file.filename;
    }

}
