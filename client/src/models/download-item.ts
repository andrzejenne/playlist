import {SearchItem} from "./search-item";

export class DownloadItem extends SearchItem {
  started: boolean;
  finished: boolean;
  files: { name: string, progress: number }[];
  status: string[];
}