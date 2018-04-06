import {Component, OnDestroy} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Subscription} from "rxjs/Subscription";
import {SearchRepository} from "../../repositories/search.repository";
import {SearchItem} from "../../models/search-item";
import {Search} from "../../models/search";
import {WampService} from "../../services/WampService";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage implements OnDestroy {

    public search: string;

    public history: Search[] = [];

    public list: SearchItem[] = [];

    public focused = false;

    private allHistory: Search[];

    private subs: Subscription[] = [];

    private iwamp: number;

    constructor(public navCtrl: NavController, private repo: SearchRepository, private wamp: WampService) {
        this.subs.push(this.wamp.subscribe(session => this.subscribeWamp()));
    }

    public onSearchClick() {
        console.info('onSearchClick');
        this.searchItems();
    }

    public getSearchHistory() {
        console.info('getSearchHistory');

        this.subs.push(
            this.repo.getSearchHistory()
                .subscribe(response => {
                    this.allHistory = response;
                    this.filterHistory();
                })
        );
    }

    public removeSearchHistory(event: MouseEvent, item: Search) {
        event.preventDefault();
        event.stopPropagation();

        this.subs.push(
            this.repo.removeSearchHistory(item.id)
                .subscribe(response => this.removeSearchHistoryItem(item))
        );
    }

    public getInfo(event: MouseEvent, item: SearchItem) {
        this.subs.push(
            this.repo.getInfo(item.sid)
                .subscribe(response => console.info(response))
        );
    }

    public download(event: MouseEvent, item: SearchItem) {
        this.subs.push(
            this.repo.download(item.sid)
                .subscribe(response => console.info(response))
        );
    }

    public searchItems(query?: string) {
        console.info('searchItems');

        if (query) {
            this.search = query;
        }

        this.history = [];

        this.subs.push(
            this.repo.search(this.search)
                .subscribe(response => this.list = response.items)
        );
    }

    click1() {
        this.wamp.call('com.hello.world.cli');
    }

    click2() {
        this.wamp.call('com.hello.world').then(result => console.info('call result', result));
    }

    click3() {
        this.wamp.publish('sub.say.hi.cli', [{message: 'hihi'}]);
    }

    click4() {
        this.wamp.publish('sub.say.hi', [{message: 'hi backend'}]);
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
