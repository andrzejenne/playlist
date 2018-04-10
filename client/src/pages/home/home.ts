import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Subscription} from "rxjs/Subscription";
import {SearchRepository} from "../../repositories/search.repository";
import {SearchItem} from "../../models/search-item";
import {Search} from "../../models/search";
import {WampService} from "../../services/WampService";
import {AuthService} from "../../services/AuthService";

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

    private allHistory: Search[];

    private subs: Subscription[] = [];

    private iwamp: number;

    constructor(
        public navCtrl: NavController,
        private repo: SearchRepository,
        private wamp: WampService,
        private auth: AuthService,
        private ref: ChangeDetectorRef
    ) {
        this.subs.push(this.wamp.subscribe(session => this.subscribeWamp()));

        this.userData = this.auth.getUser();
    }

    public onSearchClick() {
        console.info('onSearchClick');
        this.searchItems();
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
        this.repo.download(item.sid)
            .then(response => console.info(response))
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
            }
        }
    }

}
