import {Injectable} from "@angular/core";
import {SearchPage} from "../pages/search/search";
import {HomePage} from "../pages/home/home";

@Injectable()
export class PagesService {

    private pages = {
        'home': HomePage,
        'search': SearchPage,
        // 'downloaded': DownloadedPage,
        // 'downloadQueue': DownloadQueue
    };

    get(code: string) {
        return this.pages[code] || HomePage;
    }
}