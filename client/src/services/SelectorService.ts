import {Injectable} from "@angular/core";

@Injectable()
export class SelectorService<T> {
  selected: T[] = [];

  get length() {
    return this.selected.length;
  }

  isSelected(item: T) {
    return this.selected.indexOf(item) > -1;
  }

  toggleSelect(item: T) {
    if (this.isSelected(item)) {
      let index = this.selected.indexOf(item);
      this.selected.splice(index, 1);
    }
    else {
      this.selected.push(item);
    }
  }

  clearSelection() {
    this.selected = [];
  }

  selectAll(items: T[]) {
    this.selected = [].concat(items);
  }

  toggleSelectAll(items: T[]) {
    if (this.selected.length) {
      this.clearSelection();
    }
    else {
      this.selectAll(items);
    }
  }
}