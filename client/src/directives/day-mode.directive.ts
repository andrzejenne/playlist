import {Directive, Host, Optional, Self} from "@angular/core";
import {ConfigService} from "../services/ConfigService";
import {Subscription} from "rxjs/Subscription";
import {Navbar, Toolbar} from "ionic-angular";

@Directive({
  selector: '[day-mode]'
})
export class DayModeDirective {
  private dayMode: boolean = true;

  private sub: Subscription;

  private cmps: any[] = [];

  constructor(private config: ConfigService,
    @Host() @Self() @Optional() private toolbarCmp: Toolbar,
    @Host() @Self() @Optional() private navbarCmp: Navbar,
  ) {

    toolbarCmp && this.cmps.push(toolbarCmp);
    navbarCmp && this.cmps.push(navbarCmp);

    this.sub = config.settings$.subscribe(settings => {
      if (settings && settings.dayMode) {
        if (this.dayMode != settings.dayMode.value) {
          this.dayMode = settings.dayMode.value;
          this.setColor(this.dayMode ? 'primary' : 'dark');
        }
      }
    });
  }

  private setColor(color: string) {
    this.cmps.forEach(cmp => {
      if (cmp['color']) {
        cmp.color = color;
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}