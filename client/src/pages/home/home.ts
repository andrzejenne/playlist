import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SearchRepository } from '../../repositories/search.repository';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public search: string;

  public searchList: string[];

  private searchListSub: Subscription;

  constructor(public navCtrl: NavController, private repo: SearchRepository) {

  }

  public getItems() {
    console.info('getItems');
    return [];
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
