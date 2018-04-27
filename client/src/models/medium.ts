import {Model} from "./model";
import {MediaFile} from "./media-file";
import {MediaProvider} from "./media-provider";

export class Medium extends Model {
  name: string;
  released: Date;
  files: MediaFile[];

  provider?: MediaProvider;
  provider_sid: string;

  artist?: any;
  album?: any;
  genre?: any;

  public static getFile(item: Medium, type: string) {
    let files = item.files.filter(file => file.type.slug == type);

    if (files.length) {
      return files[0];
    }

    return null;
  }

  public static getUrl(item: Medium, type: string) {
    let file = this.getFile(item, type);
    if (!file && type != 'video') {
      file = this.getFile(item, 'video');
    }

    if (file) {
      return this.getFileUrl(item, file);
    }

    return null;
  }

  public static getFileUrl(item: Medium, file: MediaFile) {
    return 'http://localhost:8000/media/' + item.provider_sid + '/' + file.id;
  }

}