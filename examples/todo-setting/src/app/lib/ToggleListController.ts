import type { ToggleView } from './ToggleView';
import { Toggled } from './ToggleView';
import { ListView } from 'rune-ts';

type ExtractItemView<T> = T extends ListView<infer IV> ? IV : never;

export class ToggleListController<TV extends ToggleView, LV extends ListView<ExtractItemView<LV>>> {
  constructor(
    public toggleAllView: TV,
    public listView: LV,
    private getItemViewOn: (itemView: ExtractItemView<LV>) => boolean,
    private setItemViewOn: (itemView: ExtractItemView<LV>, bool: boolean) => void,
  ) {
    this.toggleAllView.data.on = this.isAllOn();
    this.toggleAllView.addEventListener(Toggled, (e) => this.toggleAll(e.detail.on));
    this.listView.addEventListener(Toggled, () => this.syncToggleAllView());
  }

  toggleAll(bool: boolean) {
    this.listView.itemViews
      .filter((itemView) => this.getItemViewOn(itemView) !== bool)
      .forEach((itemView) => this.setItemViewOn(itemView, bool));
  }

  syncToggleAllView() {
    this.toggleAllView.setOn(this.isAllOn());
  }

  isAllOn() {
    return this.listView.itemViews.every(this.getItemViewOn);
  }
}
