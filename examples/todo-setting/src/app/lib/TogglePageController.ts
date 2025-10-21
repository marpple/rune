import { Toggled, ToggleView } from './ToggleView';
import { ListView } from 'rune-ts';

type ExtractItemView<T> = T extends ListView<infer IV> ? IV : never;

export interface TogglePage<LV extends ListView<ExtractItemView<LV>>> {
  toggleAllView: ToggleView;
  listView: LV;
  getItemViewOn(itemView: ExtractItemView<LV>): boolean;
  setItemViewOn(itemView: ExtractItemView<LV>, bool: boolean): void;
}

export class TogglePageController<LV extends ListView<ExtractItemView<LV>>> {
  constructor(private togglePage: TogglePage<LV>) {
    const toggleView: ToggleView = this.togglePage.toggleAllView;
    const listView: LV = this.togglePage.listView;
    toggleView.data.on = this.isAllOn();
    toggleView.addEventListener(Toggled, (e) => this.toggleAll(e.detail.on));
    listView.addEventListener(Toggled, () => this.syncToggleAllView());
  }

  private toggleAll(on: boolean) {
    const { listView, getItemViewOn, setItemViewOn } = this.togglePage;
    listView.itemViews
      .filter((itemView) => getItemViewOn(itemView) !== on)
      .forEach((itemView) => setItemViewOn(itemView, on));
  }

  private syncToggleAllView() {
    this.togglePage.toggleAllView.setOn(this.isAllOn());
  }

  private isAllOn() {
    return this.togglePage.listView.itemViews.every(this.togglePage.getItemViewOn);
  }
}
