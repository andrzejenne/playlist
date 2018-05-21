import {ChangeDetectorRef, Component} from "@angular/core";
import {NavParams} from "ionic-angular";
import {Artist} from "../../../../models/artist";
import {LibraryManagerService} from "../../../../services/LibraryManagerService";

@Component({
  selector: 'artists-tab',
  templateUrl: 'artists.html'
})
export class ArtistsTab {

  all: Artist[] = [];

  list: Artist[] = [];

  count: number;

  private limit = 30;

  private offset = 0;

  private end = false;

  constructor(params: NavParams, private libManager: LibraryManagerService, private ref: ChangeDetectorRef) {
    this.count = params.data || [];
  }

  ngAfterViewInit() {
    this.load()
      .then(data => this.ref.detectChanges());
  }

  private load() {
    return this.libManager.artists(this.limit, this.offset)
      .then(data => {
        console.info('ArtistsTab.data', data);
        if (data.length != this.limit) {
          this.end = true;
        }
        if (this.offset) {
          this.all = this.all.concat(data);
          this.list = [].concat(this.all);
        }
        else {
          this.all = data;
          this.list = [].concat(data);
        }
        this.ref.detectChanges();
      });
  }

  doInfinite(infiniteScroll: any) {
    console.log('doInfinite, start is currently ' + this.offset);

    if (!this.end) {
      this.offset += this.limit;

      this.load()
        .then(data => infiniteScroll.complete());
    }
    else {
      infiniteScroll.complete();
    }
  }
}
