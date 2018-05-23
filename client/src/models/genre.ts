import {Model} from "./model";
import {Medium} from "./medium";

export class Genre extends Model {
  name: string;

  media?: Medium[];
}
