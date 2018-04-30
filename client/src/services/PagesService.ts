import {Injectable} from "@angular/core";
import {SearchPage} from "../pages/search/search";
import {HomePage} from "../pages/home/home";
import {DownloadedPage} from "../pages/downloaded/downloaded";
import {DownloadQueueComponent} from "../components/download-queue/download-queue.component";
import {SettingsPage} from "../pages/settings/settings";

@Injectable()
export class PagesService {

  private pages = {
    'home': HomePage,
    'search': SearchPage,
    'downloaded': DownloadedPage,
    'downloadQueue': DownloadQueueComponent,
    'settings': SettingsPage
  };

  get(code: string) {
    return this.pages[code] || HomePage;
  }
}