import {Injectable} from "@angular/core";
import {Model} from "./model";

@Injectable()
export class User extends Model {
  name: string;
  email: string;
  avatar: string;
  provider: string;
  provider_id: string;
}