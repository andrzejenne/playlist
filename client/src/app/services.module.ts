import {NgModule} from "@angular/core";

import {ConfigService} from "../services/ConfigService";
import {PagesService} from "../services/PagesService";
import {WampService} from "../services/WampService";
import {AuthService} from "../services/AuthService";
import {BrowserModule} from "@angular/platform-browser";
import {HttpClientModule} from "@angular/common/http";
import {DownloadManager} from "../services/DownloadManager";
import {WampRepository} from "../repositories/wamp.repository";
import {PlaylistsRepository} from "../repositories/playlists.repository";
import {SearchRepository} from "../repositories/search.repository";
import {ServerManagerService} from "../services/ServerManagerService";
import {IonicStorageModule} from "@ionic/storage";
import {ErrorReporting} from "../services/ErrorReporting";
import {FullscreenObserverService} from "../services/FullscreenObserverService";
import {MediaManagerService} from "../services/MediaManagerService";
import {PlaylistsManagerService} from "../services/PlaylistsManagerService";
import {LibraryManagerService} from "../services/LibraryManagerService";
import {LibraryRepository} from "../repositories/library.repository";
import {MediaRepository} from "../repositories/media.repository";
import {OfflineManagerService} from "../services/OfflineManagerService";
import {CloudRepository} from "../repositories/cloud.repository";
import {PlayerService} from "../services/PlayerService";
import {AppRepository} from "../repositories/app.repository";
import {File} from "@ionic-native/file";

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
    LibraryManagerService,

    FullscreenObserverService,
    PlayerService,
    OfflineManagerService,

    File,

    // repos
    WampRepository,
    SearchRepository,
    CloudRepository,
    PlaylistsRepository,
    LibraryRepository,
    MediaRepository,
    AppRepository,

  ],
  exports: [
    BrowserModule,
    HttpClientModule
  ]
})
export class ServicesModule {

}
