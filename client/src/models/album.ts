import {Model} from "./model";
import {Genre} from "./genre";
import {Medium} from "./medium";
import {Cover} from "./cover";
import {Artist} from "./artist";

export class Album extends Model {
  name: string;
  released: number;

  artist?: Artist;
  genre?: Genre;
  media?: Medium[];
  covers?: Cover[];

  duration?: number;

}
