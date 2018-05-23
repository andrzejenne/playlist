import {MediaProvider} from "./media-provider";

export class Provider {
  name: string;

  ionic: {
    component: string;
    menuIcon: string;
  };

  entity: MediaProvider;

  delete: boolean;
  search: boolean;
}