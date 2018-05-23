import {MediaProvider} from "./media-provider";

export class Provider {
  name: string;

  ionic: {
    component: any;
  };

  entity: MediaProvider;

  delete: boolean;
  search: boolean;
}