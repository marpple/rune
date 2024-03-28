import { View } from 'rune-ts';
import type { ToggleView } from './ToggleView';
import type { ListView } from './ListView';

interface CheckableViewInterface<IV extends View<object>> {
  checkAllView: ToggleView;
  listView: ListView<object, IV>;
  getItemViewChecked(itemView: IV): boolean;
  setItemViewChecked(itemView: IV, bool: boolean): void;
}

export class CheckableViewController<IV extends View<object>> {
  constructor(public view: CheckableViewInterface<IV>) {
    this.view.checkAllView.data.on = this.isCheckAll();
    this.view.checkAllView.addEventListener('change', () => this._checkAll());
    this.view.listView.addEventListener('change', () => this.syncCheckAll());
  }

  private _checkAll() {
    const { on } = this.view.checkAllView.data;
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
