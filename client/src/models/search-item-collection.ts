import {SearchItem} from "./search-item";

export class SearchItemCollection {
  provider: string;
  items: SearchItem[];
  next: string;
  prev: string;
}