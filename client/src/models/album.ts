import {Model} from "./model";
import {Genre} from "./genre";
import {Medium} from "./medium";
import {Cover} from "./cover";

export class Album extends Model {
  name: string;
  released: number;

  genre?: Genre;
  media?: Medium[];
  covers?: Cover[];
}
