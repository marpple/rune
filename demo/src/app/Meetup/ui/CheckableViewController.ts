import { View, type ListView } from 'rune-ts';
import type { ToggleView } from './ToggleView';
import { Toggled } from './ToggleView';

interface CheckableViewInterface<T extends object, IV extends View<T>> {
  checkAllView: ToggleView;
  listView: ListView<T, IV>;
  getItemViewChecked(itemView: IV): boolean;
  setItemViewChecked(itemView: IV, bool: boolean): void;
}

export class CheckableViewController<T extends object, IV extends View<T>> {
  constructor(public view: CheckableViewInterface<T, IV>) {
    this.view.checkAllView.data.on = this.isCheckAll();
    this.view.checkAllView.addEventListener(Toggled, (e: Toggled) => this._checkAll(e.detail));
    this.view.listView.addEventListener(Toggled, () => this.syncCheckAll());
  }

  private _checkAll(on: boolean) {
    this.view.listView.itemViews
      .filter((itemView) => this.view.getItemViewChecked(itemView) !== on)
      .forEach((itemView) => this.view.setItemViewChecked(itemView, on));
  }

  syncCheckAll() {
    this.view.checkAllView.setOn(this.isCheckAll());
  }

  isCheckAll() {
    return this.view.listView.itemViews.every((itemView) => this.view.getItemViewChecked(itemView));
  }
}
