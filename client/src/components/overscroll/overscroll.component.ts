import {AfterContentInit, AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from "@angular/core";
import {Content} from "ionic-angular";
import {Subscription} from "rxjs/Subscription";
import {ElementReference} from "../../models/ElementReference";

@Component({
  selector: 'overscroll',
  templateUrl: 'overscroll.component.html'
})
export class OverscrollComponent implements OnDestroy, AfterContentInit, AfterViewInit {

  @Input()
  maxWidth = 2000;

  @Input()
  speed = 50;

  @Input()
  delay = '2s';

  private visible = false;

  private sub: Subscription;

  @ViewChild('wrap')
  private wrap: ElementReference<HTMLDivElement>;

  @ViewChild('content')
  private wrapContent: ElementReference<HTMLDivElement>;

  constructor(private content: Content, private ref: ElementRef) {

  }

  ngAfterContentInit(): void {
    this.sub = this.content.ionScrollEnd.subscribe(data => this.onScrollEnd(data));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.wrap.nativeElement.style.width = this.maxWidth + 'px';

    this.visible = this.isVisible();

    this.visible && this.scroll();
  }

  private onScrollEnd(data) {
    console.info('OnScrollEnd', data);

    this.visible = this.isVisible();
  }

  private scroll() {
    let containerWidth = this.ref.nativeElement.clientWidth;
    let contentWidth = this.wrapContent.nativeElement.clientWidth;

    console.info(containerWidth, contentWidth);

    let missingWidth = contentWidth - containerWidth;
    let delay = this.delay.indexOf('ms') > -1 ? parseInt(this.delay) / 1000 : parseInt(this.delay);

    if (missingWidth > 0) {
      let duration = missingWidth / this.speed;
      this.wrapContent.nativeElement.style.left = -missingWidth + 'px';
      this.wrapContent.nativeElement.style.transitionDuration = duration + 's';
      this.wrapContent.nativeElement.style.transitionDelay = this.delay;

      setTimeout(() => {
        this.wrapContent.nativeElement.style.left = 0 + 'px';
        setTimeout(() => {
          this.visible && this.scroll();
        }, (duration + delay) * 1000)
      }, (duration + delay) * 1000);
      // this.ref.nativeElement.style.
    }
  }

  private isVisible() {
    let brect = this.ref.nativeElement.getBoundingClientRect();
    let cbrect = this.content.getElementRef().nativeElement.getBoundingClientRect();
    // console.info('is', brect, cbrect, document.body.getBoundingClientRect());

    return brect.top >= cbrect.top
      && brect.left >= cbrect.left
      && brect.right <= cbrect.right
      && brect.bottom <= cbrect.bottom;
  }
}
