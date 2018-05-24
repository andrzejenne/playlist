import {MediaProvider} from "./media-provider";

export class Provider {
  slug: string;

  ionic: {
    component: string;
    menuIcon: string;
    title: string;
  };

  entity: MediaProvider;

  delete: boolean;
  search: boolean;
}