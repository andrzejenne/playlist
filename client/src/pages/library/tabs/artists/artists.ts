import {Component} from "@angular/core";
import {NavParams} from "ionic-angular";
import {Artist} from "../../../../models/artist";

@Component({
  selector: 'artists-tab',
  templateUrl: 'artists.html'
})
export class ArtistsTab {

  artists: Artist[] = [];

  constructor(params: NavParams) {
    this.artists = params.data || [];
  }
}
