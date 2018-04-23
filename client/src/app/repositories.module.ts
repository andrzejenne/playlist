import {NgModule} from "@angular/core";

import {SearchRepository} from "../repositories/search.repository";
import {DownloadedRepository} from "../repositories/downloaded.repository";
import {PlaylistsRepository} from "../repositories/playlists.repository";
import {ServicesModule} from "./services.module";
import {WampRepository} from "../repositories/wamp.repository";
import {BrowserModule} from "@angular/platform-browser";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        ServicesModule,
    ],
    providers: [
        WampRepository,
        SearchRepository,
        DownloadedRepository,
        PlaylistsRepository,
    ],
    exports: [
        ServicesModule,
        BrowserModule,
        HttpClientModule,
    ]
})
export class RepositoriesModule {

}