import {NgModule} from "@angular/core";

import {ConfigService} from "../services/ConfigService";
import {PagesService} from "../services/PagesService";
import {WampService} from "../services/WampService";
import {AuthService} from "../services/AuthService";
import {BrowserModule} from "@angular/platform-browser";
import {HttpClientModule} from "@angular/common/http";
import {DownloadManager} from "../services/DownloadManager";
import {WampRepository} from "../repositories/wamp.repository";
import {DownloadedRepository} from "../repositories/downloaded.repository";
import {PlaylistsRepository} from "../repositories/playlists.repository";
import {SearchRepository} from "../repositories/search.repository";

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    ConfigService,
    WampService,
    AuthService,
    PagesService,
    DownloadManager,

    // repos
    WampRepository,
    SearchRepository,
    DownloadedRepository,
    PlaylistsRepository,

  ],
  exports: [
    BrowserModule,
    HttpClientModule
  ]
})
export class ServicesModule {

}
