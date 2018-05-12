import {Component, ElementRef, Input, ViewChild} from "@angular/core";
import {User} from "../../../models/user";
import {ViewController} from "ionic-angular";
import {PlaylistsManagerService} from "../../../services/PlaylistsManagerService";

@Component({
  selector: 'add-playlist-component',
  templateUrl: 'add-playlist.component.html'
})
export class AddPlaylistComponent {
  @ViewChild('input', {read: ElementRef}) input: ElementRef;

  public name: string;

  @Input()
  private user: User;

  constructor(
    public viewCtrl: ViewController,
    private plManager: PlaylistsManagerService,
    // private auth: AuthService
  ) {

  }

  // ionViewDidLoad() {
  //   this.auth.getUser().then(user => this.user = user);
  //   setTimeout(() => {
  //     let input = this.input.nativeElement.querySelector('input');
  //     this.renderer.invokeElementMethod(input, 'focus');
  //     this.keyboard.show();
  //   }, 500);
  // }

  createPlaylist() {
    if (this.name) {
      this.plManager.create(this.user, this.name);
    }
    this.viewCtrl.dismiss();
  }
}
