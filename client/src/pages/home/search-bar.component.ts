import {Component} from '@angular/core';
import {Subscription} from "rxjs/Subscription";
import {SearchRepository} from "../../repositories/search.repository";

@Component({
  selector: 'search-bar',
  templateUrl: 'search-bar.component.html'
})
export class SearchBarComponent {
  public searchList: string[];

  private searchListSub: Subscription;

  constructor(private repo: SearchRepository) {

  }

  public getSearchList() {
    console.info('getSearchList');

    if (this.searchListSub) {
      this.searchListSub.unsubscribe();
    }

    this.searchListSub = this.repo.getSearchList()
      .subscribe(response => this.searchList = response)
  }
}
