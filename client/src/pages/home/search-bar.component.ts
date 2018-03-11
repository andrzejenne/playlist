import {Component} from '@angular/core';
import {Subscription} from "rxjs/Subscription";
import {SearchRepository} from "../../repositories/search.repository";
import {Search} from "../../models/search";

@Component({
  selector: 'search-bar',
  templateUrl: 'search-bar.component.html'
})
export class SearchBarComponent {
  public searchList: Search[];

  search: string;


  // (ionInput)="getItems($event)"

  private searchListSub: Subscription;

  constructor(private repo: SearchRepository) {

  }

  public getSearchList() {
    console.info('getSearchList');

    if (this.searchListSub) {
      this.searchListSub.unsubscribe();
    }

    this.searchListSub = this.repo.getSearchHistory()
      .subscribe(response => this.searchList = response)
  }
}
