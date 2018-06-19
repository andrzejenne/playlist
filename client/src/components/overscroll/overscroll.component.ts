import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy, SimpleChanges,
  ViewChild
} from "@angular/core";
import {Content} from "ionic-angular";
import {Subscription} from "rxjs/Subscription";
import {ElementReference} from "../../models/ElementReference";
import {ConfigService} from "../../services/ConfigService";

@Component({
  selector: 'overscroll',
  templateUrl: 'overscroll.component.html'
})
export class OverscrollComponent implements OnDestroy, AfterContentInit, AfterViewInit, OnChanges {

  @Input()
  maxWidth = 2000;

  @Input()
  speed = 50;

  @Input()
  delay = '2s';

  @Input()
  disabled = false;

  @Input()
  decide: any;

  private visible = false;

  private scrolling = false;

  private tout: number;

  private sub: Subscription;

  @ViewChild('wrap')
  private wrap: ElementReference<HTMLDivElement>;

  @ViewChild('content')
  private wrapContent: ElementReference<HTMLDivElement>;

  constructor(
    private content: Content,
    private config: ConfigService,
    private ref: ElementRef
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled'] || changes['decide']) {

      setTimeout(() => {
        this.visible = this.isVisible();

        this.decideToScroll();

        console.info('OverscrollComponent@ngOnChanges', changes['disabled']);

      }, 100);
    }
  }



  ngAfterContentInit(): void {
    this.sub = this.content.ionScrollEnd.subscribe(data => this.onScrollEnd(data));
    // @todo - sub to config.settings$
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.wrap.nativeElement.style.width = this.maxWidth + 'px';

    this.visible = this.isVisible();

    this.decideToScroll();
  }

  private onScrollEnd(data) {
    // console.info('OnScrollEnd', data);

    this.visible = this.isVisible();

    this.decideToScroll();
  }

  private decideToScroll() {
    if (this.config.settings && this.config.settings.ui.scrollOverflowed) {
      if (this.disabled) {
        if (this.scrolling) {
          this.stopScroll();
        }
      }
      else {
        if (this.visible) {
          if (!this.scrolling) {
            this.scroll();
          }
        }
        else {
          if (this.scrolling) {
            this.stopScroll();
          }
        }
      }
    }
  }

  private scroll() {
    let containerWidth = this.ref.nativeElement.clientWidth;
    let contentWidth = this.wrapContent.nativeElement.clientWidth;

    // console.info(containerWidth, contentWidth);

    let missingWidth = contentWidth - containerWidth;
    let delay = this.delay.indexOf('ms') > -1 ? parseInt(this.delay) / 1000 : parseInt(this.delay);

    if (missingWidth > 0) {
      let duration = missingWidth / this.speed;
      this.wrapContent.nativeElement.style.left = -missingWidth + 'px';
      this.wrapContent.nativeElement.style.transitionDuration = duration + 's';
      this.wrapContent.nativeElement.style.transitionDelay = this.delay;

      // @todo - optimize, add cancelation when not visible
      this.tout = setTimeout(() => {
        this.wrapContent.nativeElement.style.left = 0 + 'px';
        this.tout = setTimeout(() => {
          this.visible && this.scroll();
        }, (duration + delay) * 1000)
      }, (duration + delay) * 1000);

      this.scrolling = true;
      // this.ref.nativeElement.style.
    }
  }

  private stopScroll() {
    if (this.tout) {
      clearTimeout(this.tout);
    }

    this.wrapContent.nativeElement.style.left = 0 + 'px';
    this.wrapContent.nativeElement.style.transitionDuration = 0 + 's';

    this.scrolling = false;
  }

  private isVisible() {
    let brect = this.ref.nativeElement.getBoundingClientRect();
    let cbrect = this.content.getElementRef().nativeElement.getBoundingClientRect();
    // let cbrect  = document.body.getBoundingClientRect();

    return (
        brect.top <= cbrect.bottom
        || brect.top >= cbrect.top
      )
      &&
      (
        brect.bottom >= cbrect.top
        || brect.bottom <= cbrect.bottom
      )
      &&
      (
        brect.left <= cbrect.right
        || brect.left >= cbrect.left
      )
      &&
      (
        brect.right >= cbrect.left
        || brect.right <= cbrect.right
      );

    // console.info(is);

    // return is;
  }
}
