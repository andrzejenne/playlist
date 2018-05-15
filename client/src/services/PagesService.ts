import {Injectable} from "@angular/core";
import {SearchPage} from "../pages/search/search";
import {PlaylistsPage} from "../pages/playlists/playlists";
import {DownloadedPage} from "../pages/downloaded/downloaded";
import {DownloadQueueComponent} from "../components/download-queue/download-queue.component";
import {SettingsPage} from "../pages/settings/settings";
import {LibraryPage} from "../pages/library/library";
import {YouTubePage} from "../pages/youtube/youtube";

@Injectable()
export class PagesService {

  private pages = {
    'playlists': PlaylistsPage,
    'search': SearchPage,
    'downloaded': DownloadedPage,
    'downloadQueue': DownloadQueueComponent,
    'settings': SettingsPage,
    'library': LibraryPage,
    'youtube': YouTubePage
  };

  get(code: string) {
    return this.pages[code] || PlaylistsPage;
  }
}
