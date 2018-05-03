import {Component, ElementRef, Renderer, ViewChild} from "@angular/core";
import {Keyboard} from "@ionic-native/keyboard";
import {PlaylistsRepository} from "../../../repositories/playlists.repository";
import {AuthService} from "../../../services/AuthService";
import {User} from "../../../models/user";
import {ViewController} from "ionic-angular";

@Component({
  selector: 'add-playlist-component',
  templateUrl: 'add-playlist.component.html'
})
export class AddPlaylistComponent {
  @ViewChild('input', {read: ElementRef}) input: ElementRef;

  public name: string;

  private user: User;

  constructor(
    public viewCtrl: ViewController,
    private keyboard: Keyboard,
    private renderer: Renderer,
    private repo: PlaylistsRepository,
    private auth: AuthService
  ) {

  }

  ionViewDidLoad() {
    this.auth.getUser().then(user => this.user = user);
    setTimeout(() => {
      let input = this.input.nativeElement.querySelector('input');
      this.renderer.invokeElementMethod(input, 'focus');
      this.keyboard.show();
    }, 500);
  }

  createPlaylist() {
    if (this.name) {
      this.repo.create(this.user.id, this.name);
    }
    this.viewCtrl.dismiss();
  }
}
