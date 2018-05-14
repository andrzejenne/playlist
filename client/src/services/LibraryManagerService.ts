import {Injectable} from "@angular/core";
import {LibraryRepository} from "../repositories/library.repository";
import {Artist} from "../models/artist";
import {Album} from "../models/album";
import {Genre} from "../models/genre";

@Injectable()
export class LibraryManagerService {

  artists: Artist[];

  albums: Album[];

  genres: Genre[];

  constructor(private repo: LibraryRepository) {

  }

  ready() {
    console.info('LibraryManagerService@ready');
    return Promise.all([this.repo.albums(), this.repo.artists(), this.repo.genres()])
      .then(data => {
        this.albums = <Album[]>data[0];
        this.artists = <Artist[]>data[1];
        this.genres = <Genre[]>data[2];

        return {
          artists: this.artists,
          albums: this.albums,
          genres: this.genres
        };
      });
  }
}
