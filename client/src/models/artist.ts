import {Model} from "./model";

export class Artist extends Model {
  name: string;
  count?: {
    media: number;
    albums: number;
  }
}
