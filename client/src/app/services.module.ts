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
import {ServerManagerService} from "../services/ServerManagerService";
import {IonicStorageModule} from "@ionic/storage";
import {ErrorReporting} from "../services/ErrorReporting";
import {FullscreenObserverService} from "../services/FullscreenObserverService";
import {MediaManagerService} from "../services/MediaManagerService";
import {PlaylistsManagerService} from "../services/PlaylistsManagerService";

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicStorageModule
  ],
  providers: [
    ConfigService,
    WampService,
    AuthService,
    PagesService,
    DownloadManager,
    ServerManagerService,
    MediaManagerService,
    ErrorReporting,
    PlaylistsManagerService,

    FullscreenObserverService,

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
