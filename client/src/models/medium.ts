import {Model} from "./model";
import {MediaFile} from "./media-file";
import {MediaProvider} from "./media-provider";

export class Medium extends Model {
  name: string;
  released: number;
  duration: number;
  files: MediaFile[];

  provider?: MediaProvider;
  provider_sid: string;

  artist?: {
    name: string;
  };
  album?: {
    name: string;
  };
  genre?: {
    name: string;
  };
}
