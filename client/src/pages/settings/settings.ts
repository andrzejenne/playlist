import {Component, OnDestroy} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {ConfigService} from "../../services/ConfigService";
import {SettingsContract} from "../../services/contracts/SettingsContract";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage implements OnDestroy {

  settings: SettingsContract = null;

  private subs: Subscription[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private config: ConfigService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');

    this.subs.push(
      this.config.settings$.subscribe(settings => this.settings = settings)
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  onApplyTap() {
    this.config.save(this.settings);
  }

}
