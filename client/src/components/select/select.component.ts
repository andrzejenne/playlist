import {Component, EventEmitter, forwardRef, HostBinding, Input, Output} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'simple-select',
  templateUrl: 'select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements ControlValueAccessor {
  @Input()
  options: { value: any, label: string }[] = [];

  @Input()
  icon?: string;

  @Input()
  label?: string;

  @Input()
  iconColor?: string = 'primary';

  @Input()
  color: string = 'primary';

  @Input() disabled = false;
  @HostBinding('style.opacity')
  get opacity() {
    return this.disabled ? 0.25 : 1;
  }

  @Output()
  change: EventEmitter<any> = new EventEmitter<any>();

  // Function to call when the rating changes.
  onChange = (value: any) => {
    console.info('onChange', value);
  };

  // Function to call when the input is touched (when a star is clicked).
  onTouched = () => {};

  private model: any = null;

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    console.info('writeValue', obj);
    this.model = obj;
    this.onChange(obj);
  }
}