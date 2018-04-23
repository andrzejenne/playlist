import {Injectable} from '@angular/core';
import {WampRepository} from "./wamp.repository";
import {Playlist} from "../models/playlist";

@Injectable()
export class PlaylistsRepository extends WampRepository {

    public list(uid: number) {
        return this.call<Playlist[]>('com.playlists.list', [{uid: uid}]);
    }
}