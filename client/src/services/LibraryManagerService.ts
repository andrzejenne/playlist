import {Injectable} from "@angular/core";
import {LibraryRepository} from "../repositories/library.repository";

@Injectable()
export class LibraryManagerService {

  albumsCount: number;

  artistsCount: number;

  genresCount: number;

  constructor(private repo: LibraryRepository) {

  }

  ready() {
    console.info('LibraryManagerService@ready');
    return Promise.all([
      this.repo.albumsCount(),
      this.repo.artistsCount(),
      this.repo.genresCount()
    ])
      .then(data => {
        this.albumsCount = data[0];
        this.artistsCount = data[1];
        this.genresCount = data[2];

        return {
          artistsCount: this.artistsCount,
          albumsCount: this.albumsCount,
          genresCount: this.genresCount
        };
      });
  }

  albums(limit = 50, offset = 0) {
    return this.repo.albums(limit, offset);
  }

  artists(limit = 50, offset = 0) {
    return this.repo.artists(limit, offset);
  }

  genres(limit = 50, offset = 0) {
    return this.repo.genres(limit, offset);
  }

}
