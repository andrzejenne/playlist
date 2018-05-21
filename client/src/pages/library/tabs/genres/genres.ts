import {ChangeDetectorRef, Component} from "@angular/core";
import {NavParams} from "ionic-angular";
import {Genre} from "../../../../models/genre";
import {LibraryManagerService} from "../../../../services/LibraryManagerService";

@Component({
  selector: 'genres-tab',
  templateUrl: 'genres.html'
})
export class GenresTab {

  all: Genre[] = [];

  list: Genre[] = [];

  count: number;

  private limit = 30;

  private offset = 0;

  private end = false;

  constructor(
    params: NavParams,
    private libManager: LibraryManagerService,
    private ref:ChangeDetectorRef
  ) {
    this.count = params.data || [];
  }

  ngAfterViewInit() {
    this.load()
      .then(data => this.ref.detectChanges());
  }

  private load() {
    return this.libManager.genres(this.limit, this.offset)
      .then(data => {
        console.info('GenresTab.data', data);
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
