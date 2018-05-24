import {Pipe, PipeTransform} from '@angular/core';

/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({name: 'duration'})
export class DurationPipe implements PipeTransform {
  transform(value: number): string {
    if (isFinite(value)) {
      let h = Math.floor(value / 3600);
      let hs = h * 3600;
      let m = Math.floor((value - hs) / 60);
      let ms = m * 60;
      let s = value - hs - ms;

      let r = [];
      if (h) {
        r.push(h, m < 10 ? '0' + m : m, s < 10 ? '0' + s.toFixed(1) : s.toFixed(1));
      }
      else {
        if (m) {
          r.push(m, s < 10 ? '0' + s.toFixed(1) : s.toFixed(1));
        }
        else {
          r.push(s.toFixed(1));
        }
      }

      return r.join(':');
    }

    return '';
  }
}