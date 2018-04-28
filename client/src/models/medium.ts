import {Model} from "./model";
import {MediaFile} from "./media-file";
import {MediaProvider} from "./media-provider";

export class Medium extends Model {
  name: string;
  released: Date;
  files: MediaFile[];

  provider?: MediaProvider;
  provider_sid: string;

  artist?: any;
  album?: any;
  genre?: any;
}
