import {Injectable} from "@angular/core";
import {SearchPage} from "../pages/search/search";
import {PlaylistsPage} from "../pages/playlists/playlists";
import {DownloadQueueComponent} from "../components/download-queue/download-queue.component";
import {SettingsPage} from "../pages/settings/settings";
import {LibraryPage} from "../pages/library/library";
import {CloudPage} from "../pages/cloud/cloud";

@Injectable()
export class PagesService {

  private pages = {
    'playlists': PlaylistsPage,
    'search': SearchPage,
    'cloud': CloudPage,
    'downloadQueue': DownloadQueueComponent,
    'settings': SettingsPage,
    'library': LibraryPage,
  };

  get(code: string) {
    return this.pages[code] || PlaylistsPage;
  }
}
