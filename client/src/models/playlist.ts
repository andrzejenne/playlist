import {Model} from "./model";
import {Medium} from "./medium";

export class Playlist extends Model {
  name: string;
  description?: string;

  count?: number;
  duration?: number;

  media?: Medium[];
}
