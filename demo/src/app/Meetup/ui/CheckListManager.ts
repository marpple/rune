import { type View, type ListView } from 'rune-ts';
import type { ToggleView } from './ToggleView';
import { Toggled } from './ToggleView';

export class CheckListManager<T extends object, IV extends View<T>> {
  constructor(
    public checkAllView: ToggleView,
    public listView: ListView<T, IV>,
    private getItemViewChecked: (itemView: IV) => boolean,
    private setItemViewChecked: (itemView: IV, bool: boolean) => void,
  ) {
    this.checkAllView.data.on = this.isCheckAll();
    this.checkAllView.addEventListener(Toggled, (e: Toggled) => this._checkAll(e.detail));
    this.listView.addEventListener(Toggled, () => this.syncCheckAll());
  }

  private _checkAll(on: boolean) {
    this.listView.itemViews
      .filter((itemView) => this.getItemViewChecked(itemView) !== on)
      .forEach((itemView) => this.setItemViewChecked(itemView, on));
  }

  syncCheckAll() {
    this.checkAllView.setOn(this.isCheckAll());
  }

  isCheckAll() {
    return Boolean(
      this.listView.itemViews.length &&
        this.listView.itemViews.every((itemView) => this.getItemViewChecked(itemView)),
    );
  }
}
