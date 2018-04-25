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

  public static getUrl(item: Medium, type: string) {
    let files = item.files.filter(file => file.type.slug == type);
    if (!files.length) {
      files = item.files.filter(file => file.type.slug == 'video');
    }
    let file = files[0];

    return this.getFileUrl(item, file);
  }

  public static getFileUrl(item: Medium, file: MediaFile) {
    return 'http://localhost:8000/media/' + item.provider.slug + '/' + item.provider_sid[0] + item.provider_sid[1] + '/' + item.provider_sid[2] + item.provider_sid[3] + '/' + file.filename;
  }

}