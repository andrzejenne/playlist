import {Injectable} from "@angular/core";
import {ServerManagerService} from "./ServerManagerService";
import {Medium} from "../models/medium";
import {MediaFile} from "../models/media-file";

@Injectable()
export class MediaManagerService {

  constructor(private serverManager: ServerManagerService) {

  }

  hasVideo(item: Medium) {
    let file = this.getFile(item, 'video');

    return file && file.type.slug == 'video';
  }

  hasAudio(item: Medium) {
    let file = this.getFile(item, 'audio');

    return file && file.type.slug == 'audio';
  }

  getFile(item: Medium, type: string) {
    let files = item.files.filter(file => file.type.slug == type);

    if (files.length) {
      return files[0];
    }

    return null;
  }

  getUrl(item: Medium, type: string, host = this.serverManager.host) {
    let file = this.getFile(item, type);
    if (!file && type != 'video') {
      file = this.getFile(item, 'video');
    }

    if (file) {
      return this.getFileUrl(item, file, host);
    }

    return null;
  }

  getFileUrl(item: Medium, file: MediaFile, host = this.serverManager.host) {
    return this.serverManager.getServerUrl(host) + '/media/' + item.id + '/' + file.id;
  }

  getThumbnailUrl(item: Medium) {
    let thumb = MediaManagerService.getThumbnail(item);
    if (thumb) {
      return this.getFileUrl(item, thumb) + '?get';
    }

    return '/assets/imgs/thumbnail.png';
  }

  static getThumbnail(item: Medium) {
    for (let i = 0; i < item.files.length; i++) {
      if ('thumbnail' === item.files[i].type.slug) {
        return item.files[i];
      }
    }

    return null;
  }
}