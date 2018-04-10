import {Injectable} from "@angular/core";
import {WampService} from "../services/WampService";
import {ConfigService} from "../services/ConfigService";

@Injectable()
export class WampRepository {
    constructor(protected wamp: WampService, protected config: ConfigService) {

    }
}