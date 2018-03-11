import {Component, OnDestroy} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Subscription} from "rxjs/Subscription";
import {SearchRepository} from "../../repositories/search.repository";
import {SearchItem} from "../../models/search-item";
import {Search} from "../../models/search";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnDestroy {

  public search: string;

  public history: Search[] = [];

  public list: SearchItem[] = [];

  public focused = false;

  private allHistory: Search[];

  private subs: Subscription[] = [];

  constructor(public navCtrl: NavController, private repo: SearchRepository) {

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


  public ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
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

}
