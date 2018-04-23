import {NgModule} from "@angular/core";

import {ConfigService} from "../services/ConfigService";
import {PagesService} from "../services/PagesService";
import {WampService} from "../services/WampService";
import {AuthService} from "../services/AuthService";
import {BrowserModule} from "@angular/platform-browser";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
    ],
    providers: [
        ConfigService,
        WampService,
        AuthService,
        PagesService,
    ],
    exports: [
        BrowserModule,
        HttpClientModule,
    ]
})
export class ServicesModule {

}