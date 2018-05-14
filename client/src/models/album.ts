import {Model} from "./model";
import {Genre} from "./genre";

export class Album extends Model {
  name: string;
  released: number;
  genre?: Genre;
}
