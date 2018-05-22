import {Model} from "./model";
import {Medium} from "./medium";
import {Album} from "./album";

export class Artist extends Model {
  name: string;

  albums?: Album[];
  media?: Medium[];
  count?: {
    media: number;
    albums: number;
  }
}
