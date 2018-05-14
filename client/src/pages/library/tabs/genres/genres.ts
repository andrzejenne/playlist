import {Component} from "@angular/core";
import {NavParams} from "ionic-angular";
import {Genre} from "../../../../models/genre";

@Component({
  selector: 'genres-tab',
  templateUrl: 'genres.html'
})
export class GenresTab {

  genres: Genre[];

  constructor(params: NavParams) {
    this.genres = params.data || [];
  }
}
