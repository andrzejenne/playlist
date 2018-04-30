import {ChangeDetectorRef, Component} from '@angular/core';
import {NavController} from "ionic-angular";
import {WampService} from "../../services/WampService";
import {SettingsPage} from "../settings/settings";
import {HomePage} from "../home/home";
import {Storage} from '@ionic/storage';

@Component({
  selector: 'welcome',
  templateUrl: 'welcome.html'
})
export class WelcomePage {
  connected = false;

  public autojump: boolean;

  public options: any = {};

  constructor(
    public navCtrl: NavController,
    private wamp: WampService,
    private storage: Storage,
    private ref: ChangeDetectorRef
  ) {

  }

  ionViewDidLoad() {
    // @todo - multi server support
    this.wamp.onOpen.subscribe(session => {
      this.connected = true;
      this.ref.detectChanges();
    });

    this.wamp.onClose.subscribe( session => {
      this.connected = false;
      this.ref.detectChanges();
    });
  }

  goToServers() {
    this.navCtrl.push(SettingsPage);
  }

  goToPlaylist() {
   // this.navCtrl.push(HomePage);
    this.navCtrl.setRoot(HomePage);
  }

  updateAutojump(checkbox: any) {
    this.options.autojump = checkbox.checked;

    this.storage.set('options', this.options);
  }
}
