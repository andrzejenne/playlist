import {Model} from "./model";
import {Genre} from "./genre";
import {Medium} from "./medium";

export class Album extends Model {
  name: string;
  released: number;

  cover?: any;
  genre?: Genre;
  media?: Medium[];
}
