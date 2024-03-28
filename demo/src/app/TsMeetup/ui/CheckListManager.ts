import { type View, type ListView } from 'rune-ts';
import type { ToggleView } from './ToggleView';

export class CheckListManager<T extends object, IV extends View<T>> {
  constructor(
    public checkAllView: ToggleView,
    public listView: ListView<T, IV>,
    private getItemViewChecked: (itemView: IV) => boolean,
    private setItemViewChecked: (itemView: IV, bool: boolean) => void,
  ) {
    this.checkAllView.data.on = this.isCheckAll();
    this.checkAllView.addEventListener('change', () => this._checkAll());
    this.listView.addEventListener('change', () => this.syncCheckAll());
  }

  private _checkAll() {
    const { on } = this.checkAllView.data;
    this.listView.itemViews
      .filter((itemView) => this.getItemViewChecked(itemView) !== on)
      .forEach((itemView) => this.setItemViewChecked(itemView, on));
  }

  syncCheckAll() {
    this.checkAllView.setOn(this.isCheckAll());
  }

  isCheckAll() {
    return this.listView.itemViews.every((itemView) => this.getItemViewChecked(itemView));
  }
}
