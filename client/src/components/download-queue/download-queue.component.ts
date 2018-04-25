import {Component} from "@angular/core";
import {DownloadManager} from "../../services/DownloadManager";
import {ViewController} from "ionic-angular";
import {Subscription} from "rxjs/Subscription";
import {DownloadItem} from "../../models/download-item";

@Component({
  selector: 'download-queue-component',
  templateUrl: 'download-queue.component.html'
})
export class DownloadQueueComponent {
  items: DownloadItem[] = [];

  private sub: Subscription;

  constructor(private downloadManager: DownloadManager, private view: ViewController) { //}, private params: NavParams) {
    this.items = this.downloadManager.downloads;
  }

  ionViewDidLoad() {
    this.sub = this.downloadManager.onChange(this.onDownloadManagerChange);
    // this.sub = this.downloadManager.onChange(items => this.items = items);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onDownloadManagerChange = (downloads: any[]) => {
    // @todo - check if optimal
    this.items = [].concat(downloads);
  };

  dismiss() {
    this.view.dismiss();
  }


}