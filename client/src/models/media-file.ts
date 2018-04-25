import {Model} from "./model";
import {MediaFileType} from "./media-file-type";

export class MediaFile extends Model {
  filename: string;
  size: number;
  type?: MediaFileType;
}